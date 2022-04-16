import { CLS_NAMESPACE } from './cls-hook.helper'

export function getFont(): string {
  const fontMap: Record<string, string> = {
    en: 'Roboto',
    hk: 'Noto',
  }

  const language = CLS_NAMESPACE.get('language')
  const fallbackFont = fontMap['en']
  if (language && typeof language === 'string') {
    return fontMap[language] || fallbackFont
  }
  return fallbackFont
}
