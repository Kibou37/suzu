import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const QUOTE_CONTACT_METHODS = ['PHONE', 'EMAIL', 'EITHER'] as const;
export type QuoteContactMethodValue = (typeof QUOTE_CONTACT_METHODS)[number];

export class CreateQuoteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  customerPhone!: string;

  @IsEmail()
  @MaxLength(180)
  customerEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  carSlug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  modelName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  summary!: string;

  @IsNumber()
  @Min(0)
  @Max(10_000_000)
  totalPrice!: number;

  @IsOptional()
  snapshot?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  configurationId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  dealerId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  dealerName!: string;

  @IsIn(QUOTE_CONTACT_METHODS)
  contactMethod!: QuoteContactMethodValue;

  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}
