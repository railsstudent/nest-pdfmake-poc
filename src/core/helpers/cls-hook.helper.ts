import clsHook = require('cls-hooked')

const CLS_NAMESPACE_NAME = 'translation'
export const CLS_NAMESPACE = clsHook.createNamespace(CLS_NAMESPACE_NAME)

export function runInLanguage(language: string, callback: (...args: unknown[]) => Promise<unknown>) {
  return CLS_NAMESPACE.runAndReturn(() => {
    CLS_NAMESPACE.set('language', language)
    return callback()
  })
}
