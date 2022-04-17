import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common'
import { Response } from 'express'
import { DynamicContent } from 'pdfmake/interfaces'

import * as low from 'lowdb'
import * as FileSync from 'lowdb/adapters/FileSync'
import * as path from 'path'
import { DateFnsService, getDateLocale, PdfService, runInLanguage, translate, translates } from '@/core'
import { env } from '@/config'
import { DbSchema, OrderItem, User } from '../interfaces'

@Injectable()
export class InvoiceService {
  constructor(private pdfService: PdfService, private dateService: DateFnsService) {}

  async generate(res: Response, id: number): Promise<void> {
    const { email, name, language } = this.getUser(id)
    return runInLanguage(language, async () => {
      const footer: DynamicContent = (currentPage: number, pageCount: number) => {
        const strPageCount = translate('invoice.invoice.page_number', {
          args: { currentPage, pageCount },
        })
        return { text: strPageCount, alignment: 'right', margin: 10 }
      }

      const htmlInvoice = this.getInvoiceHtml(name, email)
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

  private getInvoiceHtml(name: string, email: string): string {
    const {
      billTo,
      dateOfIssue,
      paymentMethod,
      creditCard,
      description,
      unitPrice,
      quantity,
      totalAmount: strTotalAmount,
      total,
      title,
    } = this.getInvoiceTranslatedValues()
    const { locale, format } = getDateLocale()
    const issuedDate = this.dateService.formatDate(new Date(Date.now()), format, locale)

    const items: OrderItem[] = [
      {
        description: 'English Textbook',
        price: 40,
        quantity: 2,
      },
      {
        description: 'A pair of black socks',
        price: 20,
        quantity: 5,
      },
      {
        description: 'Japanese Textbook',
        price: 22.5,
        quantity: 1,
      },
      {
        description: 'Japanese Workbook',
        price: 12.5,
        quantity: 1,
      },
    ]

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

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
            <td style="width:55%; text-align: left; font-size: 20px; font-style: italic; font-weight: bold; color: #7a7a7a">${description}</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; font-weight: bold; color: #7a7a7a">${unitPrice}</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; font-weight: bold; color: #7a7a7a">${quantity}</td>
            <td style="width:15%; text-align: right; font-size: 20px; font-style: italic; font-weight: bold; color: #7a7a7a">${total}</td>
            </tr>
            ${this.getOrderItemsHtml(items)}
            <tr>
            <td style="text-align:right" height="30" colspan="3">${strTotalAmount}</td>
            <td style="text-align:right; padding: 5px;" height="30">${totalAmount}</td>
            </tr>
        </table>
    </div>
    `
  }

  private getOrderItemsHtml(items: OrderItem[]): string {
    return items.reduce((acc, item) => {
      const { description, quantity, price } = item
      const row = `
        <tr>
        <td style="text-align:left" height="30">${description}</td>
        <td style="text-align:right; padding: 5px;" height="30">${price}</td>
        <td style="text-align:right; padding: 5px;" height="30">${quantity}</td>
        <td style="text-align:right; padding: 5px;" height="30">${price * quantity}</td>
        </tr>
      `
      return `${acc}${row}`
    }, '')
  }

  private getInvoiceTranslatedValues() {
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
    ] = translates([
      'invoice.invoice.bill_to',
      'invoice.invoice.date_of_issue',
      'invoice.invoice.payment_method',
      'invoice.invoice.credit_card',
      'invoice.invoice.description',
      'invoice.invoice.unit_price',
      'invoice.invoice.quantity',
      'invoice.invoice.total',
      'invoice.invoice.total_amount',
      'invoice.invoice.title',
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

  private getUser(userId: number): Omit<User, 'id'> {
    // load language from JSON database
    const adapter = new FileSync<DbSchema>(path.join(env.ROOT_PATH, 'db.json'))
    const db = low(adapter)
    const user: User = db.get('users').find({ id: userId }).value()
    if (!user) {
      throw new BadRequestException()
    }

    const { id, ...rest } = user
    return rest
  }
}
