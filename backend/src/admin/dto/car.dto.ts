import { BodyType, CarCondition, FuelType, Transmission } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCarDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsEnum(CarCondition)
  condition!: CarCondition;

  @IsInt()
  @Min(1990)
  year!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(BodyType)
  bodyType!: BodyType;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsEnum(Transmission)
  transmission!: Transmission;

  @IsOptional()
  @IsString()
  trim?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  horsepower?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;

  @IsOptional()
  @IsString()
  offerLabel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  variantName?: string;
}

export class UpdateCarDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(CarCondition)
  condition?: CarCondition;

  @IsOptional()
  @IsInt()
  @Min(1990)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsString()
  trim?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  horsepower?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;

  @IsOptional()
  @IsString()
  offerLabel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
