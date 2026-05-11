import { createContext } from 'react'
import type { Locale, Messages } from './translations'

export type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  m: Messages
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
