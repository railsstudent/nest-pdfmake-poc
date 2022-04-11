import { Inject, Injectable } from '@nestjs/common'
import PdfPrinter = require('pdfmake')
import htmlToPdfmake = require('html-to-pdfmake')
import jsdom = require('jsdom')
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import clsHook = require('cls-hooked')
import { PDF_MAKER_SYMBOL } from '../constants'

const clsNamespace = clsHook.createNamespace('translation')

@Injectable()
export class PdfService {
  private readonly fontMap: Record<string, string> = {
    en: 'Roboto',
    hk: 'Noto',
  }
  constructor(@Inject(PDF_MAKER_SYMBOL) private pdfPrinter: PdfPrinter) {}

  makeDocument(htmlString: string, optionalDefinition: Omit<TDocumentDefinitions, 'content'> = {}): PDFKit.PDFDocument {
    const { window } = new jsdom.JSDOM('')
    const content = htmlToPdfmake(htmlString, { tableAutoSize: true, window })
    const language = clsNamespace.get('language') as string
    const font = this.fontMap[language] || 'Roboto'
    const docDefinition: TDocumentDefinitions = { ...optionalDefinition, content, defaultStyle: { font } }
    return this.pdfPrinter.createPdfKitDocument(docDefinition)
  }
}
