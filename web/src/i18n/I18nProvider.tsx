import { useState, useCallback, ReactNode, useEffect } from 'react'
import { I18nContext, Locale, TranslationKey, createTranslator } from './index'

interface I18nProviderProps {
  children: ReactNode
}

const LOCALE_STORAGE_KEY = 'tally-locale'

function getInitialLocale(): Locale {
  // 从 localStorage 读取
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') {
    return stored
  }
  
  // 从浏览器语言检测
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  return 'en'
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return createTranslator(locale)(key, params)
    },
    [locale]
  )

  // 设置 html lang 属性
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
