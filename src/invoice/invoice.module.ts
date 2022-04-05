import { Module } from '@nestjs/common'
import { InvoiceService } from './services'
import { InvoiceController } from './controllers'

@Module({
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
