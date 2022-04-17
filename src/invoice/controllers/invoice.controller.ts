import { Controller, Param, ParseIntPipe, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { InvoiceService } from '../services'

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post(':userId')
  generateInvoice(@Res() res: Response, @Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.invoiceService.generateService(res, userId)
  }
}
