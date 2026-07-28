import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFaqDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  question!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  answer!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  answer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
