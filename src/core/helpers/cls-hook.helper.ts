import { TranslateOptions } from 'nestjs-i18n'
import { TranslationService } from '../services'

import { CLS_NAMESPACE } from './cls-namespace.constant'

export function runInLanguage(language: string, callback: (...args: unknown[]) => Promise<unknown>) {
  return CLS_NAMESPACE.runAndReturn(() => {
    CLS_NAMESPACE.set('language', language)
    return callback()
  })
}

export function getCurrentLanguage(): string {
  return TranslationService.getInstance().getCurrentLanguage()
}

export function translate(i18nKey: string, options?: TranslateOptions) {
  return TranslationService.getInstance().translate(i18nKey, options)
}
