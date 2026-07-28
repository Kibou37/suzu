import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuoteStatus } from '@prisma/client';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminQuotesService } from './admin-quotes.service';
import { OPERATIONS_ROLES } from './admin-permissions';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

@ApiTags('admin')
@Controller('admin/quotes')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
@Roles(...OPERATIONS_ROLES)
export class AdminQuotesController {
  constructor(private readonly quotesService: AdminQuotesService) {}

  @Get()
  list(@Query('status') status?: QuoteStatus) {
    return this.quotesService.list(status);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() body: UpdateQuoteStatusDto) {
    return this.quotesService.updateStatus(id, body.status);
  }
}
