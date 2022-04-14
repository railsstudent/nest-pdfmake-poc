import { Injectable, StreamableFile } from '@nestjs/common'
import { Response } from 'express'
import { DynamicContent } from 'pdfmake/interfaces'
import { I18nService } from 'nestjs-i18n'
import { enUS, zhHK } from 'date-fns/locale'
import { DateFnsService, PdfService, runInLanguage, getCurrentLanguage, translate } from '@/core'
import { GenerateInvoiceDto } from '../dtos'

@Injectable()
export class InvoiceService {
  private readonly dateLocaleMap: Record<string, { locale: Locale; format: string }> = {
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

    const language = await this.getLanguage()
    return runInLanguage(language, async () => {
      const footer: DynamicContent = (currentPage: number, pageCount: number) => {
        const strPageCount = this.i18nService.translate('invoice.invoice.page_number', {
          lang: language,
          args: { currentPage, pageCount },
        })
        return { text: strPageCount, alignment: 'right', margin: 10 }
      }

      const htmlInvoice = await this.getInvoiceHtml(name, email)
      const pdfDoc = this.pdfService.makeDocument(htmlInvoice, { footer })
      return this.pdfService.streamDoc(pdfDoc).then((buffer) => {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="invoice.pdf"',
        })
        new StreamableFile(buffer).getStream().pipe(res)
      })
    }) as Promise<void>
  }

  private async getInvoiceHtml(name: string, email: string): Promise<string> {
    const language = getCurrentLanguage()
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
    } = await this.getInvoiceTranslatedValues(language)
    const { locale, format } = this.dateLocaleMap[language]
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

  private getLanguage(): Promise<string> {
    // pretend to load language from database
    const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))
    return delay(1000).then(() => 'en')
  }

  private async getInvoiceTranslatedValues(language: string) {
    const option = { lang: language }
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
      translate('invoice.invoice.bill_to', option),
      translate('invoice.invoice.date_of_issue', option),
      translate('invoice.invoice.payment_method', option),
      translate('invoice.invoice.credit_card', option),
      translate('invoice.invoice.description', option),
      translate('invoice.invoice.unit_price', option),
      translate('invoice.invoice.quantity', option),
      translate('invoice.invoice.total', option),
      translate('invoice.invoice.total_amount', option),
      translate('invoice.invoice.title', option),
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
}
