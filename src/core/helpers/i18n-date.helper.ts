import { enUS, zhHK } from 'date-fns/locale'
import { currentLanguage } from './translation.helper'

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

  const language = currentLanguage()
  return dateLocaleMap[language]
}
