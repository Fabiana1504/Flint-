import { createContext, useContext, useState, type ReactNode } from 'react'
import { en, type Translations } from '@/lib/i18n/en'
import { es } from '@/lib/i18n/es'

export type Lang = 'en' | 'es'

interface LangContextValue {
  lang: Lang
  t: Translations
  toggle: () => void
}

const translations: Record<Lang, Translations> = { en, es }

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('flint-lang')
    if (stored === 'en' || stored === 'es') return stored
    return navigator.language.startsWith('es') ? 'es' : 'en'
  })

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'es' : 'en'
    localStorage.setItem('flint-lang', next)
    setLang(next)
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be inside LangProvider')
  return ctx
}
