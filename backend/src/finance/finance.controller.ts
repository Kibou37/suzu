import { Body, Controller, Get, Post } from '@nestjs/common';
import { FinanceQuoteDto } from './dto/finance-quote.dto';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('rates')
  rates() {
    return this.financeService.getRates();
  }

  @Post('quote')
  quote(@Body() body: FinanceQuoteDto) {
    return this.financeService.quote(body);
  }
}
