import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateConfigurationDto {
  @IsOptional()
  @IsString()
  configurationId?: string;

  @IsString()
  @MinLength(1)
  carSlug!: string;

  @IsOptional()
  @IsString()
  bodyColorId?: string;

  @IsOptional()
  @IsString()
  interiorColorId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedOptionIds?: string[];

  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  snapshot?: Record<string, unknown>;
}
