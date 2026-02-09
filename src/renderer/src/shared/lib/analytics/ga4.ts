type Ga4Config = {
  send_page_view?: boolean;
  debug_mode?: boolean;
  user_id?: string;
  [key: string]: unknown;
};

type Ga4PageViewParams = {
  page_path?: string;
  page_location?: string;
  page_title?: string;
  [key: string]: unknown;
};

type GtagFn = {
  (command: 'js', date: Date): void;
  (command: 'config', measurementId: string, config?: Ga4Config): void;
  (command: 'set', params: Record<string, unknown>): void;
  (command: 'event', eventName: string, params?: Record<string, unknown>): void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

let activeMeasurementId: string | null = null;
let initialized = false;

function ensureGtagStub() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
}

function injectGtagScript(measurementId: string) {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-ga4="gtag"][data-measurement-id="${measurementId}"]`,
  );
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    measurementId,
  )}`;
  script.dataset.ga4 = 'gtag';
  script.dataset.measurementId = measurementId;
  document.head.appendChild(script);
}

export function initGA4(measurementId: string, config?: Ga4Config) {
  if (!measurementId) return;
  if (initialized && activeMeasurementId === measurementId) return;

  activeMeasurementId = measurementId;
  initialized = true;

  ensureGtagStub();
  injectGtagScript(measurementId);

  window.gtag?.('js', new Date());
  window.gtag?.('config', measurementId, {
    send_page_view: false,
    ...config,
  });
}

export function setGAUserId(userId: string) {
  if (!activeMeasurementId) return;
  if (!userId) return;
  ensureGtagStub();

  // Apply to subsequent events/config
  window.gtag?.('set', { user_id: userId });
  window.gtag?.('config', activeMeasurementId, { user_id: userId });
}

export function trackPageView(params?: Ga4PageViewParams) {
  if (!activeMeasurementId) return;
  ensureGtagStub();

  const page_location =
    params?.page_location ??
    (typeof window !== 'undefined' ? window.location.href : undefined);

  window.gtag?.('event', 'page_view', {
    page_location,
    ...params,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  if (!activeMeasurementId) return;
  if (!eventName) return;
  ensureGtagStub();

  const sanitizedParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  window.gtag?.(
    'event',
    eventName,
    sanitizedParams && Object.keys(sanitizedParams).length > 0
      ? sanitizedParams
      : undefined,
  );
}
