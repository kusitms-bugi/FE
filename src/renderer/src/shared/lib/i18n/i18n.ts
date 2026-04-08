import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// 한국어 번역 파일 (static import - 항상 로드)
import authKo from './locales/ko/auth.json'
import calibrationKo from './locales/ko/calibration.json'
import commonKo from './locales/ko/common.json'
import dashboardKo from './locales/ko/dashboard.json'
import notificationKo from './locales/ko/notification.json'
import onboardingKo from './locales/ko/onboarding.json'
import settingsKo from './locales/ko/settings.json'
import widgetKo from './locales/ko/widget.json'

// 영어 번역 파일 (static import - 빈 객체에서 시작)
import authEn from './locales/en/auth.json'
import calibrationEn from './locales/en/calibration.json'
import commonEn from './locales/en/common.json'
import dashboardEn from './locales/en/dashboard.json'
import notificationEn from './locales/en/notification.json'
import onboardingEn from './locales/en/onboarding.json'
import settingsEn from './locales/en/settings.json'
import widgetEn from './locales/en/widget.json'

const LANGUAGE_STORAGE_KEY = 'i18n-language'

const resources = {
  ko: {
    common: commonKo,
    auth: authKo,
    onboarding: onboardingKo,
    calibration: calibrationKo,
    dashboard: dashboardKo,
    notification: notificationKo,
    widget: widgetKo,
    settings: settingsKo,
  },
  en: {
    common: commonEn,
    auth: authEn,
    onboarding: onboardingEn,
    calibration: calibrationEn,
    dashboard: dashboardEn,
    notification: notificationEn,
    widget: widgetEn,
    settings: settingsEn,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'ko',
  fallbackLng: 'ko',
  ns: [
    'common',
    'auth',
    'onboarding',
    'calibration',
    'dashboard',
    'notification',
    'widget',
    'settings',
  ],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React가 이미 이스케이프 처리
  },
})

// 언어 변경 시 localStorage에 저장
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
})

/**
 * OS 언어 감지 후 동기화
 * localStorage에 사용자 선택값이 없을 때만 OS 언어를 따름
 */
export async function syncLocaleWithOS() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored) return // 사용자가 명시적으로 선택한 언어 유지

  if (window.electronAPI?.getLocale) {
    try {
      const osLocale = await window.electronAPI.getLocale()
      const lang = osLocale.startsWith('ko') ? 'ko' : 'en'
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang)
      }
    } catch {
      // getLocale 실패 시 한국어 유지
    }
  }
}

export default i18n
