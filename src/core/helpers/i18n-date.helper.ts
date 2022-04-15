import { enUS, zhHK } from 'date-fns/locale'
import { CLS_NAMESPACE } from './cls-hook.helper'

export function getDateLocale(): { locale: Locale; format: string } {
  const dateLocaleMap: Record<string, { locale: Locale; format: string }> = {
    en: {
      locale: enUS,
      format: 'MMM dd, yyyy',
    },
    hk: {
      locale: zhHK,
      format: 'PPP',
    },
  }
  const language = CLS_NAMESPACE.get('language') as string
  return dateLocaleMap[language] || dateLocaleMap['en']
}
