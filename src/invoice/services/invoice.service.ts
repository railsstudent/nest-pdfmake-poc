import { Injectable, StreamableFile } from '@nestjs/common'
import { Response } from 'express'
import { DynamicContent } from 'pdfmake/interfaces'
import { I18nService } from 'nestjs-i18n'
import { curry } from 'lodash'
import { enUS, zhHK } from 'date-fns/locale'
import { DateFnsService, PdfService } from '@/core'
import { GenerateInvoiceDto } from '../dtos'
import { I18nTranslate } from '../types'

@Injectable()
export class InvoiceService {
  private readonly dateLocaleMap = {
    en: {
      locale: enUS,
      format: 'MMM dd, yyyy',
    },
    hk: {
      locale: zhHK,
      format: 'PPP',
    },
  }
  constructor(private pdfService: PdfService, private i18nService: I18nService, private dateService: DateFnsService) {}

  async generateService(res: Response, dto: GenerateInvoiceDto): Promise<void> {
    const { name, email } = dto
    const htmlInvoice = await this.getInvoiceHtml(name, email)

    const footer: DynamicContent = (currentPage: number, pageCount: number) => {
      const strPageCount = this.i18nService.translate('invoice.invoice.page_number', {
        lang: 'hk',
        args: { currentPage, pageCount },
      })
      return { text: strPageCount, alignment: 'right', margin: 10 }
    }

    const pdfDoc = this.pdfService.makeDocument(htmlInvoice, { footer })
    return this.streamDoc(pdfDoc).then((buffer) => {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice.pdf"',
      })
      new StreamableFile(buffer).getStream().pipe(res)
    })
  }

  private async getInvoiceHtml(name: string, email: string): Promise<string> {
    const {
      billTo,
      dateOfIssue,
      paymentMethod,
      creditCard,
      description,
      unitPrice,
      quantity,
      totalAmount,
      total,
      title,
    } = await this.getInvoiceTranslatedValues()

    const { locale, format } = this.dateLocaleMap['hk']
    const issuedDate = this.dateService.formatDate(new Date(Date.now()), format, locale)
    return `
    <div>
        <h1>${title}</h1>
        <table>
            <tr>
            <td style="width:100%; font-size: 24px;" colspan="3">${billTo}</td>
            </tr>
            <tr>
            <td style="text-align:left; width: 60%;" height="30">${name}</td>
            <td style="text-align:left; width: 20%; padding: 5px;" height="30">${dateOfIssue}</td>
            <td style="text-align:left; width: 20%; padding: 5px;" height="30">${issuedDate}</td>
            </tr>
            <tr>
            <td style="text-align:left" height="30">${email}</td>
            <td style="text-align:left; padding: 5px;" height="30">${paymentMethod}</td>
            <td style="text-align:left; padding: 5px;" height="30">${creditCard}</td>
            </tr>
        </table>
        <hr />
        <table>
            <tr>
            <td style="width:55%; text-align: left; font-size: 20px; font-style: italic; color: #7a7a7a">${description}</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; color: #7a7a7a">${unitPrice}</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; color: #7a7a7a">${quantity}</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; color: #7a7a7a">${total}</td>
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
            <td style="text-align:right" height="30" colspan="3">${totalAmount}</td>
            <td style="text-align:right; padding: 5px;" height="30">180</td>
            </tr>
        </table>
    </div>
    `
  }

  private async getInvoiceTranslatedValues() {
    const bindTranslate: I18nTranslate = this.translate.bind(this)
    const curried = curry(bindTranslate)
    const curriedI18nInvoice = curried('hk')('invoice')('invoice')
    const [
      billTo,
      dateOfIssue,
      paymentMethod,
      creditCard,
      description,
      unitPrice,
      quantity,
      total,
      totalAmount,
      title,
    ] = await Promise.all([
      curriedI18nInvoice('bill_to'),
      curriedI18nInvoice('date_of_issue'),
      curriedI18nInvoice('payment_method'),
      curriedI18nInvoice('credit_card'),
      curriedI18nInvoice('description'),
      curriedI18nInvoice('unit_price'),
      curriedI18nInvoice('quantity'),
      curriedI18nInvoice('total'),
      curriedI18nInvoice('total_amount'),
      curriedI18nInvoice('title'),
    ])
    return {
      billTo,
      dateOfIssue,
      paymentMethod,
      creditCard,
      description,
      unitPrice,
      quantity,
      total,
      totalAmount,
      title,
    }
  }

  private async translate(lang: string, filename: string, prefix: string, key: string) {
    const i18Key = `${filename}.${prefix}.${key}`
    const value = await this.i18nService.translate(i18Key, { lang })
    return value as string
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
