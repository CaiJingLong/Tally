import { useI18n } from '../i18n'
import { Globe } from 'lucide-react'

export default function LanguageSwitch() {
  const { locale, setLocale } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm">{locale === 'zh' ? 'EN' : '中'}</span>
    </button>
  )
}
