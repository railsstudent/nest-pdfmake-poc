import { Test, TestingModule } from '@nestjs/testing'
import { DateFnsService } from './date-fns.service'

describe('DateFnsService', () => {
  let service: DateFnsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateFnsService],
    }).compile()

    service = module.get<DateFnsService>(DateFnsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
