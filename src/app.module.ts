import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoreModule } from './core'
import { InvoiceModule } from './invoice'

@Module({
  imports: [CoreModule, InvoiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
