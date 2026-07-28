import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @MinLength(6)
  phone!: string;
}

export class VerifySmsDto {
  @IsString()
  @MinLength(6)
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class ForgotPasswordDto {
  @IsString()
  @MinLength(3)
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  passwordConfirm?: string;
}
