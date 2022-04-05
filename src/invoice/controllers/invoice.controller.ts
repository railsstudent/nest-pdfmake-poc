import { Controller, Post } from '@nestjs/common'

@Controller('invoice')
export class InvoiceController {
  @Post()
  generateInvoice() {
    console.log('Download invoice')
  }
}
