import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class GenerateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string
}
