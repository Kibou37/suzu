import { VehicleIdentifierType } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
  type SignOptions,
} from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from './current-user.decorator';

export type RegisterInput = {
  email?: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  vehicleIdentifierType?: 'VIN' | 'CHASSIS' | null;
  vehicleIdentifier?: string | null;
  dealerId?: string | null;
  dealerName?: string | null;
};

export type LoginInput = {
  login: string;
  password: string;
};

export type UserProfile = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  vehicleIdentifierType: 'VIN' | 'CHASSIS' | null;
  vehicleIdentifier: string | null;
  dealerId: string | null;
  dealerName: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: UserProfile;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  constructor(private readonly prisma: PrismaService) {}

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : '';
  }

  private syntheticEmailFromPhone(phone: string): string {
    const normalized = this.normalizePhone(phone).replace(/\+/g, '');
    return `phone-${normalized}@account.suzuki.local`;
  }

  private normalizeVehicleIdentifier(
    type: VehicleIdentifierType,
    value: string,
  ): string {
    const normalized = value.trim().toUpperCase();

    if (type === VehicleIdentifierType.VIN) {
      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) {
        throw new BadRequestException('VIN must contain 17 valid characters.');
      }
      return normalized;
    }

    if (!/^[A-Z0-9-]{5,20}$/.test(normalized)) {
      throw new BadRequestException('Chassis number must be 5–20 characters.');
    }

    return normalized;
  }

  private parseVehicleRegistration(input: RegisterInput): {
    vehicleIdentifierType: VehicleIdentifierType | null;
    vehicleIdentifier: string | null;
    dealerId: string | null;
    dealerName: string | null;
  } {
    const identifierType = input.vehicleIdentifierType || null;
    const identifier = input.vehicleIdentifier?.trim() || null;
    const dealerId = input.dealerId?.trim() || null;
    const dealerName = input.dealerName?.trim() || null;

    if (!identifierType && !identifier && !dealerId) {
      return { vehicleIdentifierType: null, vehicleIdentifier: null, dealerId: null, dealerName: null };
    }

    if (!identifierType) {
      throw new BadRequestException('Please choose VIN or chassis number.');
    }

    if (!identifier) {
      throw new BadRequestException('Please enter your VIN or chassis number.');
    }

    if (!dealerId || !dealerName) {
      throw new BadRequestException('Please select your dealer.');
    }

    const vehicleIdentifierType =
      identifierType === 'VIN'
        ? VehicleIdentifierType.VIN
        : VehicleIdentifierType.CHASSIS;

    return {
      vehicleIdentifierType,
      vehicleIdentifier: this.normalizeVehicleIdentifier(vehicleIdentifierType, identifier),
      dealerId,
      dealerName,
    };
  }

  private async findUserByLogin(login: string) {
    const trimmed = login.trim();

    if (trimmed.includes('@')) {
      return this.prisma.user.findUnique({
        where: { email: trimmed.toLowerCase() },
      });
    }

    const phone = this.normalizePhone(trimmed);
    if (!phone) {
      return null;
    }

    return this.prisma.user.findFirst({
      where: { phone },
    });
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const password = input.password.trim();
    const phone = input.phone ? this.normalizePhone(input.phone) : undefined;
    const email =
      input.email?.trim().toLowerCase() ||
      (phone ? this.syntheticEmailFromPhone(phone) : '');

    if (!email || !password) {
      throw new BadRequestException('Email or phone and password are required');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('An account with this login already exists');
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        throw new ConflictException('An account with this phone number already exists');
      }
    }

    const passwordHash = await hash(password, 10);
    const vehicleRegistration = this.parseVehicleRegistration(input);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        phone: phone || null,
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
        ...vehicleRegistration,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const password = input.password.trim();
    const user = await this.findUserByLogin(input.login);

    if (!user) {
      throw new UnauthorizedException('Invalid login or password');
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid login or password');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toUserProfile(user);
  }

  verifyAccessToken(token: string): AuthUser {
    try {
      const payload = verify(token, this.jwtSecret) as AuthUser;
      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Invalid token');
      }
      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired. Please sign in again.');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token.');
      }
      throw new UnauthorizedException('Authentication failed.');
    }
  }

  private buildAuthResponse(user: Parameters<typeof this.toUserProfile>[0]): AuthResponse {
    const signOptions: SignOptions = { expiresIn: this.jwtExpiresIn as SignOptions['expiresIn'] };
    const accessToken = sign({ sub: user.id, email: user.email }, this.jwtSecret, signOptions);

    return {
      accessToken,
      user: this.toUserProfile(user),
    };
  }

  private toUserProfile(user: {
    id: string;
    email: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    vehicleIdentifierType: VehicleIdentifierType | null;
    vehicleIdentifier: string | null;
    dealerId: string | null;
    dealerName: string | null;
  }): UserProfile {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      vehicleIdentifierType: user.vehicleIdentifierType,
      vehicleIdentifier: user.vehicleIdentifier,
      dealerId: user.dealerId,
      dealerName: user.dealerName,
    };
  }
}
