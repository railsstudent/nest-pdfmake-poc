import { Provider } from '@nestjs/common'
import Pdfmake = require('pdfmake')
import { TFontDictionary } from 'pdfmake/interfaces'
import * as path from 'path'
import { PDF_MAKER_SYMBOL } from './constants'
import { env } from '../config/env.config'

export const PDF_MAKER: Provider = {
  provide: PDF_MAKER_SYMBOL,
  useFactory: () => {
    const robotoPath = path.join(env.ROOT_PATH, 'fonts', 'Roboto')
    const notoPath = path.join(env.ROOT_PATH, 'fonts', 'NotoSans')
    const fonts: TFontDictionary = {
      Roboto: {
        normal: path.join(robotoPath, 'Roboto-Regular.ttf'),
        bold: path.join(robotoPath, 'Roboto-Medium.ttf'),
        italics: path.join(robotoPath, 'Roboto-Italic.ttf'),
        bolditalics: path.join(robotoPath, 'Roboto-MediumItalic.ttf'),
      },
      Noto: {
        normal: path.join(notoPath, 'NotoSansTC-Regular.ttf'),
        bold: path.join(notoPath, 'NotoSansTC-Medium.ttf'),
        italics: path.join(notoPath, 'NotoSansTC-Light.ttf'),
        bolditalics: path.join(notoPath, 'NotoSansTC-Bold.ttf'),
      },
    }
    return new Pdfmake(fonts)
  },
}
