import { IsIn, IsNumber, Max, Min } from 'class-validator';

export class FinanceQuoteDto {
  @IsIn(['credit', 'leasing'])
  product!: 'credit' | 'leasing';

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  downPayment!: number;

  @IsNumber()
  @Min(1)
  @Max(120)
  termMonths!: number;
}
