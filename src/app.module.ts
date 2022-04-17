import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { I18nModule } from 'nestjs-i18n'
import * as path from 'path'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoreModule } from './core'
import { InvoiceModule } from './invoice'

@Module({
  imports: [
    CoreModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
