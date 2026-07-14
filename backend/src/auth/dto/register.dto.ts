import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum VehicleIdentifierTypeDto {
  VIN = 'VIN',
  CHASSIS = 'CHASSIS',
}

export class RegisterDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email address is not valid.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?\d[\d\s\-().]{6,19}$/, {
    message: 'Phone number is not valid.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  password!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  lastName?: string;

  @IsOptional()
  @IsEnum(VehicleIdentifierTypeDto, {
    message: 'Identifier type must be VIN or CHASSIS.',
  })
  vehicleIdentifierType?: 'VIN' | 'CHASSIS';

  @ValidateIf((o: RegisterDto) => !!o.vehicleIdentifierType)
  @IsString()
  @IsNotEmpty({ message: 'Please enter your VIN or chassis number.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  vehicleIdentifier?: string;

  @ValidateIf((o: RegisterDto) => !!o.vehicleIdentifierType)
  @IsString()
  @IsNotEmpty({ message: 'Please select your dealer.' })
  dealerId?: string;

  @ValidateIf((o: RegisterDto) => !!o.vehicleIdentifierType)
  @IsString()
  @IsNotEmpty({ message: 'Please select your dealer.' })
  dealerName?: string;
}
