import { Role, VehicleIdentifierType } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes, randomInt } from 'crypto';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
  type SignOptions,
} from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';
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
  phoneVerifiedAt: string | null;
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

const OTP_TTL_SEC = 10 * 60;
const VERIFIED_TTL_SEC = 30 * 60;
const RESET_TTL_SEC = 60 * 60;
const OTP_COOLDOWN_SEC = 60;
const BCRYPT_ROUNDS = 12;

const OTP_MAX_ATTEMPTS = 5;
const OTP_LOCK_TTL_SEC = 10 * 60;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_LOCK_TTL_SEC = 15 * 60;

type MemoryEntry = { value: string; expiresAt: number };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  private readonly memory = new Map<string, MemoryEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {
    // Fail fast rather than silently signing tokens with a public string
    // that would let anyone forge an admin session.
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable must be set.');
    }
    this.jwtSecret = process.env.JWT_SECRET;
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : '';
  }

  private syntheticEmailFromPhone(phone: string): string {
    const normalized = this.normalizePhone(phone).replace(/\+/g, '');
    return `phone-${normalized}@account.suzuki.local`;
  }

  private otpKey(phone: string) {
    return `sms:otp:${phone}`;
  }

  private verifiedKey(phone: string) {
    return `sms:verified:${phone}`;
  }

  private cooldownKey(phone: string) {
    return `sms:cooldown:${phone}`;
  }

  private resetKey(tokenHash: string) {
    return `auth:reset:${tokenHash}`;
  }

  private otpAttemptsKey(phone: string) {
    return `sms:otp:attempts:${phone}`;
  }

  private loginAttemptsKey(login: string) {
    return `auth:login:attempts:${login.trim().toLowerCase()}`;
  }

  private async isLockedOut(key: string, max: number): Promise<boolean> {
    const current = Number((await this.readValue(key)) ?? '0');
    return current >= max;
  }

  private async recordFailedAttempt(
    key: string,
    ttlSeconds: number,
  ): Promise<void> {
    const current = Number((await this.readValue(key)) ?? '0');
    await this.storeValue(key, String(current + 1), ttlSeconds);
  }

  private async clearAttempts(key: string): Promise<void> {
    await this.deleteValue(key);
  }

  private purgeExpiredMemory() {
    const now = Date.now();
    for (const [key, entry] of this.memory) {
      if (entry.expiresAt <= now) this.memory.delete(key);
    }
  }

  private async storeValue(key: string, value: string, ttlSeconds: number) {
    const wrote = await this.redis.setRaw(key, value, ttlSeconds);
    if (!wrote) {
      this.purgeExpiredMemory();
      this.memory.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  private async readValue(key: string): Promise<string | null> {
    const fromRedis = await this.redis.getRaw(key);
    if (fromRedis != null) return fromRedis;

    this.purgeExpiredMemory();
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  private async deleteValue(key: string) {
    await this.redis.del(key);
    this.memory.delete(key);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
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
      return {
        vehicleIdentifierType: null,
        vehicleIdentifier: null,
        dealerId: null,
        dealerName: null,
      };
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
      vehicleIdentifier: this.normalizeVehicleIdentifier(
        vehicleIdentifierType,
        identifier,
      ),
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

  async sendSmsCode(
    phoneRaw: string,
  ): Promise<{ sent: boolean; devCode?: string }> {
    const phone = this.normalizePhone(phoneRaw);
    if (!phone || phone.length < 8) {
      throw new BadRequestException('Please enter a valid phone number');
    }

    const existingPhone = await this.prisma.user.findFirst({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException(
        'An account with this phone number already exists',
      );
    }

    const cooldown = await this.readValue(this.cooldownKey(phone));
    if (cooldown) {
      throw new BadRequestException(
        'Please wait before requesting another code',
      );
    }

    const code = String(randomInt(100000, 999999));
    await this.storeValue(this.otpKey(phone), code, OTP_TTL_SEC);
    await this.storeValue(this.cooldownKey(phone), '1', OTP_COOLDOWN_SEC);

    await this.smsService.sendVerificationCode(phone, code);

    const echo =
      process.env.SMS_DEV_ECHO === '1' ||
      (!this.smsService.isConfigured() &&
        process.env.NODE_ENV !== 'production');

    if (echo) {
      this.logger.debug(`SMS OTP for ${phone}: ${code}`);
      return { sent: true, devCode: code };
    }

    return { sent: true };
  }

  async verifySmsCode(
    phoneRaw: string,
    code: string,
  ): Promise<{ verified: boolean }> {
    const phone = this.normalizePhone(phoneRaw);
    if (!phone) {
      throw new BadRequestException('Please enter a valid phone number');
    }

    const attemptsKey = this.otpAttemptsKey(phone);
    if (await this.isLockedOut(attemptsKey, OTP_MAX_ATTEMPTS)) {
      throw new BadRequestException(
        'Too many attempts. Please request a new code.',
      );
    }

    const expected = await this.readValue(this.otpKey(phone));
    if (!expected || expected !== code.trim()) {
      await this.recordFailedAttempt(attemptsKey, OTP_LOCK_TTL_SEC);
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.clearAttempts(attemptsKey);
    await this.deleteValue(this.otpKey(phone));
    await this.storeValue(this.verifiedKey(phone), '1', VERIFIED_TTL_SEC);

    return { verified: true };
  }

  private async assertPhoneVerified(phone: string) {
    const verified = await this.readValue(this.verifiedKey(phone));
    if (!verified) {
      throw new BadRequestException(
        'Please verify your phone number with the SMS code before registering',
      );
    }
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

    if (phone) {
      await this.assertPhoneVerified(phone);
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this login already exists');
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone },
      });
      if (existingPhone) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    const passwordHash = await hash(password, BCRYPT_ROUNDS);
    const vehicleRegistration = this.parseVehicleRegistration(input);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        phone: phone || null,
        phoneVerifiedAt: phone ? new Date() : null,
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
        ...vehicleRegistration,
      },
    });

    if (phone) {
      await this.deleteValue(this.verifiedKey(phone));
    }

    return this.buildAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const attemptsKey = this.loginAttemptsKey(input.login);
    if (await this.isLockedOut(attemptsKey, LOGIN_MAX_ATTEMPTS)) {
      throw new UnauthorizedException(
        'Too many failed attempts. Please try again later.',
      );
    }

    const password = input.password.trim();
    const user = await this.findUserByLogin(input.login);
    const valid = user ? await compare(password, user.passwordHash) : false;

    if (!user || !valid) {
      await this.recordFailedAttempt(attemptsKey, LOGIN_LOCK_TTL_SEC);
      throw new UnauthorizedException('Invalid login or password');
    }

    await this.clearAttempts(attemptsKey);
    return this.buildAuthResponse(user);
  }

  async forgotPassword(emailRaw: string): Promise<{ ok: true }> {
    const email = emailRaw.trim().toLowerCase();
    if (!email.includes('@')) {
      throw new BadRequestException('Please enter a valid email address');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always OK to avoid account enumeration
    if (!user || email.endsWith('@account.suzuki.local')) {
      return { ok: true };
    }

    const token = randomBytes(32).toString('hex');
    await this.storeValue(
      this.resetKey(this.hashToken(token)),
      user.id,
      RESET_TTL_SEC,
    );

    const siteUrl = (
      process.env.CORS_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
    const resetUrl = `${siteUrl}/account/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetSafe({ email, resetUrl });

    if (
      !this.mailService.isConfigured() &&
      process.env.NODE_ENV !== 'production'
    ) {
      this.logger.debug(`Password reset token for ${email}: ${token}`);
    }

    return { ok: true };
  }

  async resetPassword(
    token: string,
    passwordRaw: string,
  ): Promise<{ ok: true }> {
    const password = passwordRaw.trim();
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const key = this.resetKey(this.hashToken(token.trim()));
    const userId = await this.readValue(key);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const passwordHash = await hash(password, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await this.deleteValue(key);

    return { ok: true };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toUserProfile(user);
  }

  async getUserRole(userId: string): Promise<Role> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user.role;
  }

  verifyAccessToken(token: string): AuthUser {
    try {
      const payload = verify(token, this.jwtSecret) as AuthUser;
      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Invalid token');
      }
      return { ...payload, role: payload.role ?? Role.CUSTOMER };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Token has expired. Please sign in again.',
        );
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token.');
      }
      throw new UnauthorizedException('Authentication failed.');
    }
  }

  private buildAuthResponse(
    user: Parameters<typeof this.toUserProfile>[0] & { role: Role },
  ): AuthResponse {
    const signOptions: SignOptions = {
      expiresIn: this.jwtExpiresIn as SignOptions['expiresIn'],
    };
    const accessToken = sign(
      { sub: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      signOptions,
    );

    return {
      accessToken,
      user: this.toUserProfile(user),
    };
  }

  private toUserProfile(user: {
    id: string;
    email: string;
    phone: string | null;
    phoneVerifiedAt?: Date | null;
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
      phoneVerifiedAt: user.phoneVerifiedAt
        ? user.phoneVerifiedAt.toISOString()
        : null,
      firstName: user.firstName,
      lastName: user.lastName,
      vehicleIdentifierType: user.vehicleIdentifierType,
      vehicleIdentifier: user.vehicleIdentifier,
      dealerId: user.dealerId,
      dealerName: user.dealerName,
    };
  }
}
