import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() body: CreateQuoteDto, @CurrentUser() user?: AuthUser) {
    return this.quotesService.create(body, user?.sub);
  }
}
