import clsHook = require('cls-hooked')
import { LANGUAGE_KEY } from '../constants'

const CLS_NAMESPACE_NAME = 'translation'
export const CLS_NAMESPACE = clsHook.createNamespace(CLS_NAMESPACE_NAME)

export function runInLanguage(language: string, callback: (...args: unknown[]) => Promise<unknown>): Promise<unknown> {
  return CLS_NAMESPACE.runAndReturn(() => {
    CLS_NAMESPACE.set(LANGUAGE_KEY, language)
    return callback()
  })
}
