import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { DeleteConfigurationDto } from './dto/delete-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() body: CreateConfigurationDto) {
    return this.configurationsService.create(user.sub, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: AuthUser) {
    return this.configurationsService.listForUser(user.sub);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  getCurrent(@CurrentUser() user: AuthUser, @Query('carSlug') carSlug: string) {
    return this.configurationsService.getCurrentForUser(user.sub, carSlug);
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  removeById(
    @CurrentUser() user: AuthUser,
    @Body() body: DeleteConfigurationDto,
  ) {
    return this.configurationsService.remove(user.sub, body.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.configurationsService.getForUser(user.sub, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateConfigurationDto,
  ) {
    return this.configurationsService.update(user.sub, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.configurationsService.remove(user.sub, id);
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard)
  removeViaPost(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.configurationsService.remove(user.sub, id);
  }

  @Post(':id/crm')
  @UseGuards(JwtAuthGuard)
  sendToCrm(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.configurationsService.resendToCrm(user.sub, id);
  }
}
