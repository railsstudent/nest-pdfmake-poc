import { Inject, Injectable } from '@nestjs/common'
import PdfPrinter from 'pdfmake'
import htmlToPdfmake from 'html-to-pdfmake'
import { PDF_MAKER_SYMBOL } from '../constants'

@Injectable()
export class PdfService {
  constructor(@Inject(PDF_MAKER_SYMBOL) private pdfPrinter: PdfPrinter) {}

  createDocument(htmlString: string): PDFKit.PDFDocument {
    const content = htmlToPdfmake(htmlString)
    const docDefinition = { content }
    return this.pdfPrinter.createPdfKitDocument(docDefinition)
  }
}
