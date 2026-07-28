import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CarsModule } from './cars/cars.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { ContactModule } from './contact/contact.module';
import { ContentModule } from './content/content.module';
import { ChatModule } from './chat/chat.module';
import { FinanceModule } from './finance/finance.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesModule } from './quotes/quotes.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    CarsModule,
    BookingsModule,
    AuthModule,
    AccountModule,
    ConfigurationsModule,
    QuotesModule,
    ContactModule,
    FinanceModule,
    ChatModule,
    AdminModule,
    ContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
