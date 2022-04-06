import { NestFactory } from '@nestjs/core'
import * as express from 'express'
import { ValidationPipe } from '@nestjs/common'
import * as compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { env } from './config/env.config'

env.ROOT_PATH = __dirname

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.use(compression())
  app.use(helmet())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  await app.listen(3000)
}
bootstrap()
  .then(() => console.log('Application started.'))
  .catch((err) => console.error(err))
