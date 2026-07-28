import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTestDriveDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  carSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  configurationId?: string;

  @IsString()
  scheduledAt!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}

export class CreateServiceDto {
  @IsString()
  scheduledAt!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  customerEmail?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  serviceType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vehicle?: string;

  @IsOptional()
  @Matches(/^[A-Za-z0-9-]{5,20}$/, {
    message: 'VIN must be 5–20 alphanumeric characters',
  })
  vin?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  mileage?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}
