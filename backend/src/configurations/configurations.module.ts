import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CrmModule } from '../crm/crm.module';
import { ConfigurationsController } from './configurations.controller';
import { ConfigurationsService } from './configurations.service';

@Module({
  imports: [AuthModule, CrmModule],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
  exports: [ConfigurationsService],
})
export class ConfigurationsModule {}
