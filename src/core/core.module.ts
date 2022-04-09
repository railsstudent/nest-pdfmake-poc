import { Module } from '@nestjs/common'
import { PDF_MAKER } from './providers'
import { PdfService, DateFnsService } from './services'

@Module({
  providers: [PdfService, PDF_MAKER, DateFnsService],
  exports: [PdfService, DateFnsService],
})
export class CoreModule {}
