import { Module } from '@nestjs/common'
import { InvoiceController } from './controllers'
import { InvoiceService } from './services'

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
