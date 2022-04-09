import { Inject, Injectable } from '@nestjs/common'
import PdfPrinter = require('pdfmake')
import htmlToPdfmake = require('html-to-pdfmake')
import jsdom = require('jsdom')
import { Style, TDocumentDefinitions } from 'pdfmake/interfaces'
import { PDF_MAKER_SYMBOL } from '../constants'

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
    const font = this.fontMap['hk'] || 'Roboto'
    const defaultStyle: Style = {
      font,
    }
    const docDefinition: TDocumentDefinitions = { ...optionalDefinition, content, defaultStyle }
    return this.pdfPrinter.createPdfKitDocument(docDefinition)
  }
}
