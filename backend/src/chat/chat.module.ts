import { Module } from '@nestjs/common';
import { CarsModule } from '../cars/cars.module';
import { CrmModule } from '../crm/crm.module';
import { FinanceModule } from '../finance/finance.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [CrmModule, CarsModule, FinanceModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
