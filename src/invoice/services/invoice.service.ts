import { Injectable, StreamableFile } from '@nestjs/common'
import { Response } from 'express'
import { DynamicContent } from 'pdfmake/interfaces'
import { PdfService } from '@/core'
import { GenerateInvoiceDto } from '../dtos'

@Injectable()
export class InvoiceService {
  constructor(private pdfService: PdfService) {}

  generateService(res: Response, dto: GenerateInvoiceDto): Promise<void> {
    const { name, email } = dto
    const htmlInvoice = `
    <div>
        <h1>Invoice</h1>
        <table>
            <tr>
            <td style="width:100%; font-size: 24px;" colspan="3">Bill to</td>
            </tr>
            <tr>
            <td style="text-align:left; width: 60%;" height="30">${name}</td>
            <td style="text-align:left; width: 20%; padding: 5px;" height="30">Date of issue</td>
            <td style="text-align:left; width: 20%; padding: 5px;" height="30">2022-04-07</td>
            </tr>
            <tr>
            <td style="text-align:left" height="30">${email}</td>
            <td style="text-align:left; padding: 5px;" height="30">Payment Method</td>
            <td style="text-align:left; padding: 5px;" height="30">Credit Card</td>
            </tr>
        </table>
        <hr />
        <table>
            <tr>
            <td style="width:55%; text-align: left; font-size: 20px; font-style: italic; color: #7a7a7a">Description</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; color: #7a7a7a">Unit Price</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; color: #7a7a7a">Quantity</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; color: #7a7a7a">Total</td>
            </tr>
            <tr>
            <td style="text-align:left" height="30">English Textbook</td>
            <td style="text-align:right; padding: 5px;" height="30">40</td>
            <td style="text-align:right; padding: 5px;" height="30">2</td>
            <td style="text-align:right; padding: 5px;" height="30">80</td>
            </tr>
            <tr>
            <td style="text-align:left" height="30">A pair of black socks</td>
            <td style="text-align:right; padding: 5px;" height="30">20</td>
            <td style="text-align:right; padding: 5px;" height="30">5</td>
            <td style="text-align:right; padding: 5px;" height="30">100</td>
            </tr>
            <tr>
            <td style="text-align:right" height="30" colspan="3">Amount</td>
            <td style="text-align:right; padding: 5px;" height="30">180</td>
            </tr>
        </table>
    </div>
    `

    const footer: DynamicContent = (currentPage: number, pageCount: number) => {
      return { text: `Page ${currentPage} of ${pageCount}`, alignment: 'right', margin: 10 }
    }

    const pdfDoc = this.pdfService.makeDocument(htmlInvoice, { footer })
    return this.streamDoc(pdfDoc).then((buffer) => {
      new StreamableFile(buffer).getStream().pipe(res)
    })
  }

  private streamDoc(pdfDoc: PDFKit.PDFDocument): Promise<Buffer> {
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
      pdfDoc.end()
    }).catch((err) => {
      if (pdfDoc) {
        pdfDoc.end()
      }
      throw err
    })
  }
}
