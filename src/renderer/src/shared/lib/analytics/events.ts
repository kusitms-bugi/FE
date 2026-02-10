import { logEvent } from './client';

export const AnalyticsEvents = {
  downloadClick: (params: { platform: 'mac' | 'windows'; source: string }) =>
    logEvent('download_click', params),

  signUpComplete: (params: { user_id?: string }) =>
    logEvent('sign_up_complete', params.user_id ? params : undefined),

  onboardingEnter: (params: { step: string }) =>
    logEvent('onboarding_enter', params),

  measurePageEnter: (params: { session_id: string }) =>
    logEvent('measure_page_enter', params),

  firstMeasureStart: (params: { seconds_from_signup: number }) =>
    logEvent('first_measure_start', params),

  measureStart: (params: { session_id: string }) =>
    logEvent('measure_start', params),

  measureEnd: (params: { session_id: string; duration_sec: number }) =>
    logEvent('measure_end', params),

  badPostureEnter: (params: { session_id: string; posture_level: number }) =>
    logEvent('bad_posture_enter', params),

  postureRecovered: (params: {
    session_id: string;
    posture_level: number;
    recovery_time_sec: number;
  }) => logEvent('posture_recovered', params),

  widgetToggle: (params: { enabled: boolean }) =>
    logEvent('widget_toggle', params),

  widgetVisibilityEnd: (params: { duration_sec: number; session_id?: string }) =>
    logEvent('widget_visibility_end', params),

  notificationToggle: (params: { enabled: boolean }) =>
    logEvent('notification_toggle', params),

  meaningfulUse: (params: { type: string }) =>
    logEvent('meaningful_use', params),
} as const;
