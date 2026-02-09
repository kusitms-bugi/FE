import { trackEvent } from './ga4';

export const AnalyticsEvents = {
  downloadClick: (params: { platform: 'mac' | 'windows'; source: string }) =>
    trackEvent('download_click', params),

  signUpComplete: (params: { user_id?: string }) =>
    trackEvent('sign_up_complete', params),

  onboardingEnter: (params: { step: string }) =>
    trackEvent('onboarding_enter', params),

  measurePageEnter: (params: { session_id: string }) =>
    trackEvent('measure_page_enter', params),

  firstMeasureStart: (params: { seconds_from_signup: number }) =>
    trackEvent('first_measure_start', params),

  measureStart: (params: { session_id: string }) =>
    trackEvent('measure_start', params),

  measureEnd: (params: { session_id: string; duration_sec: number }) =>
    trackEvent('measure_end', params),

  badPostureEnter: (params: { session_id: string; posture_level: number }) =>
    trackEvent('bad_posture_enter', params),

  postureRecovered: (params: {
    session_id: string;
    posture_level: number;
    recovery_time_sec: number;
  }) => trackEvent('posture_recovered', params),

  widgetToggle: (params: { enabled: boolean }) =>
    trackEvent('widget_toggle', params),

  widgetVisibilityEnd: (params: { duration_sec: number; session_id?: string }) =>
    trackEvent('widget_visibility_end', params),

  notificationToggle: (params: { enabled: boolean }) =>
    trackEvent('notification_toggle', params),

  meaningfulUse: (params: { type: string }) =>
    trackEvent('meaningful_use', params),
} as const;

