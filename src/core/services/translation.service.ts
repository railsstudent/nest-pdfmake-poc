import { I18nOptions, I18nService, I18N_OPTIONS, TranslateOptions } from 'nestjs-i18n'
import { Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { CLS_NAMESPACE } from '../helpers'

@Injectable()
export class TranslationService {
  private readonly i18nOptions: I18nOptions
  private static instance: TranslationService

  constructor(private i18nService: I18nService, private moduleRef: ModuleRef) {
    TranslationService.instance = this
    this.i18nOptions = this.moduleRef.get(I18N_OPTIONS, { strict: false })
  }

  static getInstance(): TranslationService {
    return this.instance
  }

  getCurrentLanguage(): string {
    const language = CLS_NAMESPACE.get('language')
    if (!language) {
      return this.i18nOptions.fallbackLanguage
    }
    return `${language}`
  }

  async translate(i18Key: string, options: TranslateOptions = {}): Promise<string> {
    if (!options.lang) {
      options.lang = this.getCurrentLanguage()
    }
    return this.i18nService.translate(i18Key, options)
  }
}
