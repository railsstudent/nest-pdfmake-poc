import { Inject, Injectable } from '@nestjs/common'
import PdfPrinter = require('pdfmake')
import htmlToPdfmake = require('html-to-pdfmake')
import jsdom = require('jsdom')
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { PDF_MAKER_SYMBOL } from '../constants'
import { getFont } from '../helpers'

@Injectable()
export class PdfService {
  constructor(@Inject(PDF_MAKER_SYMBOL) private pdfPrinter: PdfPrinter) {}

  makeDocument(htmlString: string, optionalDefinition: Omit<TDocumentDefinitions, 'content'> = {}): PDFKit.PDFDocument {
    const { window } = new jsdom.JSDOM('')
    const content = htmlToPdfmake(htmlString, { tableAutoSize: true, window })
    const font = getFont()
    const docDefinition: TDocumentDefinitions = { ...optionalDefinition, content, defaultStyle: { font } }
    return this.pdfPrinter.createPdfKitDocument(docDefinition)
  }

  streamDoc(pdfDoc: PDFKit.PDFDocument): Promise<Buffer> {
    // buffer the output
    const chunks: Uint8Array[] = []
    return new Promise((resolve: (value: Buffer) => void, reject) => {
      pdfDoc.on('data', function (chunk: Uint8Array) {
        chunks.push(chunk)
      })
      pdfDoc.on('end', function () {
        const result = Buffer.concat(chunks)
        return resolve(result)
      })
      pdfDoc.on('error', (err) => reject(err))

      // close the stream
      if (pdfDoc) {
        pdfDoc.end()
      }
    }).catch((err) => {
      if (pdfDoc) {
        pdfDoc.end()
      }
      throw err
    })
  }
}
