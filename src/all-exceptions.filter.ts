import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { HttpAdapterHost } from '@nestjs/core'
import { I18nService } from 'nestjs-i18n'

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService, private httpAdapterHost: HttpAdapterHost) {}

  private isTranslatedErrorException(
    errorResponse: object,
  ): errorResponse is { key: string; args?: Record<string, any> } {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
    if (errorResponse && (errorResponse as any).key) {
      return true
    }

    return false
  }

  private isHttpException(errorResponse: object): errorResponse is { error: string; message: string } {
    const httpException = errorResponse as any
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
    if (httpException && httpException.error && httpException.message) {
      return true
    }

    return false
  }

  async catch(exception: HttpException, host: ArgumentsHost): Promise<any> {
    const ctx = host.switchToHttp()
    const statusCode = exception.getStatus()
    const errorResponse = exception.getResponse()

    if (typeof errorResponse === 'string') {
      return {
        statusCode,
        message: errorResponse,
      }
    }

    const responseBody = await this.createResponseBody(ctx, statusCode, errorResponse)
    if (responseBody) {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
      return this.httpAdapterHost.httpAdapter.reply(ctx.getResponse(), responseBody, statusCode)
    }
    return errorResponse
  }

  private async createResponseBody(
    ctx: HttpArgumentsHost,
    statusCode: number,
    errorResponse: object,
  ): Promise<{ statusCode: number; message: string; error: string } | undefined> {
    if (this.isHttpException(errorResponse)) {
      return {
        statusCode,
        message: errorResponse.message,
        error: errorResponse.error,
      }
    }

    if (this.isTranslatedErrorException(errorResponse)) {
      const translatedMessage = await this.i18n.translate(errorResponse.key, {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
        lang: ctx.getRequest().i18nLang,
        args: errorResponse.args,
      })

      return {
        statusCode,
        message: translatedMessage,
        error: translatedMessage,
      }
    }

    return undefined
  }
}
