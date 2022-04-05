import { Module } from '@nestjs/common'
import { PDF_MAKER } from './providers'
import { PdfService } from './services'

@Module({
  providers: [PdfService, PDF_MAKER],
  exports: [PdfService],
})
export class CoreModule {}
