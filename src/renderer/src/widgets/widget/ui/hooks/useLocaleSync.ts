import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LOCALE_STORAGE_KEY = 'i18n-language'

export function useLocaleSync() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const syncLocale = () => {
      const storedLang = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (storedLang && storedLang !== i18n.language) {
        i18n.changeLanguage(storedLang)
      }
    }

    syncLocale()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCALE_STORAGE_KEY) {
        syncLocale()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [i18n])
}
