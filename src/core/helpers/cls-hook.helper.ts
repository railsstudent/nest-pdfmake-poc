import clsHook = require('cls-hooked')

const CLS_NAMESPACE_NAME = 'translation'
const CLS_NAMESPACE = clsHook.createNamespace(CLS_NAMESPACE_NAME)

export function runInLanguage(language: string, callback: (...args: unknown[]) => Promise<unknown>) {
  return CLS_NAMESPACE.runPromise(() => {
    CLS_NAMESPACE.set('language', language)
    return callback()
  })
}

export function getCurrentLanguage(): string {
  const clsNamespace = clsHook.getNamespace(CLS_NAMESPACE_NAME)
  return clsNamespace.get('language') as string
}
