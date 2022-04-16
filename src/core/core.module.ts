import { Module } from '@nestjs/common'
import { PDF_MAKER } from './providers'
import { PdfService, DateFnsService, TranslationService } from './services'

@Module({
  providers: [PdfService, PDF_MAKER, DateFnsService, TranslationService],
  exports: [PdfService, DateFnsService],
})
export class CoreModule {}
