import { TranslateOptions } from 'nestjs-i18n'
import { TranslationService } from '../services'

export function currentLanguage(): string {
  return TranslationService.instance.getCurrentLanguage()
}

export function translates(keys: string[], options?: TranslateOptions): string[] {
  return TranslationService.instance.translates(keys, options)
}

export function translate(key: string, options?: TranslateOptions): string {
  return TranslationService.instance.translate(key, options)
}
