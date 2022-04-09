import { Injectable } from '@nestjs/common'
import { format, Locale } from 'date-fns'

@Injectable()
export class DateFnsService {
  formatDate(date: Date | number, dateFormat: string, locale?: Locale): string {
    return locale ? format(date, dateFormat, { locale }) : format(date, dateFormat)
  }
}
