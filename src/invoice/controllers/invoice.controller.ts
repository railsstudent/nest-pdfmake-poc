import { Body, Controller, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { GenerateInvoiceDto } from '../dtos'
import { InvoiceService } from '../services'

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post()
  generateInvoice(@Res() res: Response, @Body() dto: GenerateInvoiceDto): Promise<void> {
    return this.invoiceService.generateService(res, dto)
  }
}
