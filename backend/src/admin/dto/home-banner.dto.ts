import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateHomeBannerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  linkLabel?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  imageDesktop!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageMobile?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHomeBannerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  linkLabel?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  imageDesktop?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageMobile?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
