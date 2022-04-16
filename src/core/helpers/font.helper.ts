import { currentLanguage } from './translation.helper'

export function getFont(): string {
  const fontMap: Record<string, string> = {
    en: 'Roboto',
    hk: 'Noto',
  }

  const language = currentLanguage()
  return fontMap[language]
}
