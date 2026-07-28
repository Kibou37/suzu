import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { FaqController } from './faq.controller';
import { HomeBannersController } from './home-banners.controller';
import { PromotionsController } from './promotions.controller';

@Module({
  controllers: [
    FaqController,
    BlogController,
    PromotionsController,
    HomeBannersController,
  ],
})
export class ContentModule {}
