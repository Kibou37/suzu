import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateConfigurationDto {
  @IsOptional()
  @IsString()
  bodyColorId?: string | null;

  @IsOptional()
  @IsString()
  interiorColorId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedOptionIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  snapshot?: Record<string, unknown>;
}
