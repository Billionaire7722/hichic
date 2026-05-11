import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { LanguageContext } from './language-context'
import type { Locale } from './translations'
import { messages } from './translations'

const STORAGE_KEY = 'hichic-locale'

function readStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'en' || raw === 'vi') return raw
  } catch {
    /* ignore */
  }
  return null
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.toLowerCase() ?? ''
  return lang.startsWith('vi') ? 'vi' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return readStoredLocale() ?? detectBrowserLocale()
  })

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'vi' ? 'vi' : 'en'
    const meta = messages[locale]
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const isVirtualTryOn = path === '/virtual-try-on'
    document.title = meta.metaTitle
    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }
    if (isVirtualTryOn) {
      document.title = meta.virtualTryOn.metaTitle
      desc.setAttribute('content', meta.virtualTryOn.metaDescription)
      return
    }
    desc.setAttribute('content', meta.metaDescription)
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      m: messages[locale],
    }),
    [locale, setLocale],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
