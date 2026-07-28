import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminBlogController } from './admin-blog.controller';
import { AdminBlogService } from './admin-blog.service';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminBookingsService } from './admin-bookings.service';
import { AdminCarsController } from './admin-cars.controller';
import { AdminCarsService } from './admin-cars.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminFaqController } from './admin-faq.controller';
import { AdminFaqService } from './admin-faq.service';
import { AdminHomeBannersController } from './admin-home-banners.controller';
import { AdminHomeBannersService } from './admin-home-banners.service';
import { AdminMediaController } from './admin-media.controller';
import { AdminMediaService } from './admin-media.service';
import { AdminPromotionsController } from './admin-promotions.controller';
import { AdminPromotionsService } from './admin-promotions.service';
import { AdminQuotesController } from './admin-quotes.controller';
import { AdminQuotesService } from './admin-quotes.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminFaqController,
    AdminBlogController,
    AdminPromotionsController,
    AdminHomeBannersController,
    AdminCarsController,
    AdminBookingsController,
    AdminQuotesController,
    AdminMediaController,
    AdminUsersController,
  ],
  providers: [
    AdminFaqService,
    AdminBlogService,
    AdminPromotionsService,
    AdminHomeBannersService,
    AdminCarsService,
    AdminBookingsService,
    AdminQuotesService,
    AdminMediaService,
    AdminUsersService,
  ],
})
export class AdminModule {}
