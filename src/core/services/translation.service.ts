import { I18nOptions, I18nService, I18N_OPTIONS, TranslateOptions } from 'nestjs-i18n'
import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { CLS_NAMESPACE } from '../helpers'
import { LANGUAGE_KEY } from '../constants'

@Injectable()
export class TranslationService {
  private readonly i18nOptions: I18nOptions
  static instance: TranslationService

  constructor(private i18nService: I18nService, private moduleRef: ModuleRef) {
    TranslationService.instance = this
    this.i18nOptions = this.moduleRef.get(I18N_OPTIONS, { strict: false })
  }

  getCurrentLanguage(): string {
    const language = CLS_NAMESPACE.get(LANGUAGE_KEY)
    if (!language) {
      return this.i18nOptions.fallbackLanguage
    }
    return `${language}`
  }

  translate(i18nKey: string, options: TranslateOptions = {}): string {
    if (!options.lang) {
      options.lang = this.getCurrentLanguage()
    }
    return this.i18nService.translate<string>(i18nKey, options)
  }

  translates(i18nKeys: string[], options: TranslateOptions = {}): string[] {
    if (!options.lang) {
      options.lang = this.getCurrentLanguage()
    }

    return i18nKeys.map((key) => this.translate(key, options))
  }
}
