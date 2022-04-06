import { Module } from '@nestjs/common'
import { CoreModule } from '@/core'
import { InvoiceService } from './services'
import { InvoiceController } from './controllers'

@Module({
  imports: [CoreModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
