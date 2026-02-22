import { app, BrowserWindow } from 'electron';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { WIDGET_CONFIG } from './widgetConfig';

/*위젯 관리 변수*/
let widgetWindow: BrowserWindow | null = null;

const PROD_WIDGET_URL = 'https://app.bugi.co.kr/widget';
const WIDGET_STATE_FILE_NAME = 'widget-window-state.json';
const WIDGET_STATE_SAVE_DELAY_MS = 120;

type WidgetWindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getWidgetStateFilePath = () =>
  join(app.getPath('userData'), WIDGET_STATE_FILE_NAME);

const loadWidgetWindowState = (): WidgetWindowState | null => {
  try {
    const filePath = getWidgetStateFilePath();
    if (!existsSync(filePath)) return null;

    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<WidgetWindowState>;
    if (
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number' ||
      typeof parsed.width !== 'number' ||
      typeof parsed.height !== 'number'
    ) {
      return null;
    }

    return {
      x: parsed.x,
      y: parsed.y,
      width: parsed.width,
      height: parsed.height,
    };
  } catch (error) {
    console.warn('[widget] Failed to load widget window state:', error);
    return null;
  }
};

const persistWidgetWindowState = (win: BrowserWindow) => {
  if (win.isDestroyed()) return;

  try {
    const bounds = win.getBounds();
    const state: WidgetWindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };

    const filePath = getWidgetStateFilePath();
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(state));
  } catch (error) {
    console.warn('[widget] Failed to persist widget window state:', error);
  }
};

const loadUrlWithRetry = async (
  win: BrowserWindow,
  url: string,
  options: { retries: number; delayMs: number },
) => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      await win.loadURL(url);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === options.retries) break;
      await sleep(options.delayMs);
    }
  }
  throw lastError;
};

/* Create a widget window (위젯 창 생성)*/
async function createWidgetWindow() {
  // 이미 위젯 창이 있으면 포커스만 주고 반환(중복 방지)
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.focus();
    return widgetWindow;
  }

  const savedState = loadWidgetWindowState();

  /* 위젯 속성 - 반응형 크기 조절 가능 */
  widgetWindow = new BrowserWindow({
    x: savedState?.x,
    y: savedState?.y,
    width: savedState?.width ?? WIDGET_CONFIG.defaultWidth,
    height: savedState?.height ?? WIDGET_CONFIG.defaultHeight,
    minWidth: WIDGET_CONFIG.minWidth,
    minHeight: WIDGET_CONFIG.minHeight,
    maxWidth: WIDGET_CONFIG.maxWidth,
    maxHeight: WIDGET_CONFIG.maxHeight,
    show: false, //깜빡임 방지
    frame: false, // 커스텀 타이틀바 사용을 위해 기본 프레임 제거

    transparent: false, // 투명 배경 비활성화 (크기 조절을 위해)

    backgroundColor: '#00000000', // 투명 배경색
    alwaysOnTop: true, // 항상 위에 표시
    resizable: true, // 크기 조절 가능 (사용자가 드래그로 크기 조절 가능)
    skipTaskbar: false, // 작업표시줄에 표시 여부
    hasShadow: true, // 그림자 추가
    webPreferences: {
      webviewTag: false,
      preload: join(__dirname, '../preload/index.cjs'), //preload 스크립트
      nodeIntegration: false, // Node.js API 직접 접근 차단
      contextIsolation: true, // Renderer와 Main 프로세스 격리
      allowRunningInsecureContent: false,
      backgroundThrottling: false,
    },
  });

  /* 창이 완전히 로드되면 표시 */
  widgetWindow.on('ready-to-show', () => {
    widgetWindow?.show();

    if (import.meta.env.DEV) {
      // widgetWindow?.webContents.openDevTools();
    }
  });

  // 위젯 창이 닫힐 때 참조 제거
  let persistStateTimer: ReturnType<typeof setTimeout> | null = null;
  const schedulePersistWidgetState = () => {
    if (!widgetWindow) return;
    if (persistStateTimer) {
      clearTimeout(persistStateTimer);
    }
    persistStateTimer = setTimeout(() => {
      if (widgetWindow) persistWidgetWindowState(widgetWindow);
    }, WIDGET_STATE_SAVE_DELAY_MS);
  };

  widgetWindow.on('move', schedulePersistWidgetState);
  widgetWindow.on('resize', schedulePersistWidgetState);
  widgetWindow.on('close', () => {
    if (widgetWindow) persistWidgetWindowState(widgetWindow);
  });

  widgetWindow.on('closed', () => {
    if (persistStateTimer) {
      clearTimeout(persistStateTimer);
      persistStateTimer = null;
    }
    widgetWindow = null;
  });

  // 위젯 전용 URL
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const widgetUrl =
    import.meta.env.DEV && devServerUrl
      ? new URL('widget', devServerUrl).toString()
      : PROD_WIDGET_URL;

  try {
    await loadUrlWithRetry(widgetWindow, widgetUrl, {
      retries: import.meta.env.DEV ? 5 : 1,
      delayMs: 400,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        `[widget] Failed to load dev widget URL (${widgetUrl}). Fallback to production URL.`,
        error,
      );
      await widgetWindow.loadURL(PROD_WIDGET_URL);
      return;
    }
    throw error;
  }
}

export async function openWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.focus();
    return widgetWindow;
  }

  return await createWidgetWindow();
}

export function closeWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.close();
  }
  widgetWindow = null;
}

export function isWidgetWindowOpen() {
  return widgetWindow !== null && !widgetWindow.isDestroyed();
}

export function getWidgetWindow() {
  return widgetWindow;
}
