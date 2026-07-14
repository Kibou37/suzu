import { getApiBaseUrl, hashPassword, isDemoDataMode, parseApiError, STORAGE_KEYS } from './config';

export type VehicleIdentifierType = 'VIN' | 'CHASSIS';

export type UserProfile = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  vehicleIdentifierType: VehicleIdentifierType | null;
  vehicleIdentifier: string | null;
  dealerId: string | null;
  dealerName: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: UserProfile;
};

export type RegisterPayload = {
  email?: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  vehicleIdentifierType?: VehicleIdentifierType;
  vehicleIdentifier?: string;
  dealerId?: string;
  dealerName?: string;
};

export type LoginPayload = {
  login: string;
  password: string;
};

type DemoUserRecord = UserProfile & {
  passwordHash: string;
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

function syntheticEmailFromPhone(phone: string): string {
  const normalized = normalizePhone(phone).replace(/\+/g, '');
  return `phone-${normalized}@account.suzuki.local`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}

function findDemoUserByLogin(
  login: string,
  users: DemoUserRecord[],
): DemoUserRecord | undefined {
  const trimmed = login.trim();
  if (trimmed.includes('@')) {
    return users.find((user) => user.email === trimmed.toLowerCase());
  }

  const phone = normalizePhone(trimmed);
  return users.find((user) => user.phone && normalizePhone(user.phone) === phone);
}

export function isSyntheticEmail(email: string): boolean {
  return email.endsWith('@account.suzuki.local');
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.authToken);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem(STORAGE_KEYS.authToken, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.authToken);
  }
}

function readDemoUsers(): DemoUserRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.demoUsers);
    return raw ? (JSON.parse(raw) as DemoUserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeDemoUsers(users: DemoUserRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.demoUsers, JSON.stringify(users));
}

function demoAuthResponse(user: DemoUserRecord): AuthResponse {
  const token = `demo-${user.id}`;
  setAuthToken(token);
  localStorage.setItem(STORAGE_KEYS.demoSession, user.id);
  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      vehicleIdentifierType: user.vehicleIdentifierType,
      vehicleIdentifier: user.vehicleIdentifier,
      dealerId: user.dealerId,
      dealerName: user.dealerName,
    },
  };
}

async function demoRegister(payload: RegisterPayload): Promise<AuthResponse> {
  const users = readDemoUsers();
  const phone = payload.phone ? normalizePhone(payload.phone) : undefined;
  const email =
    payload.email?.trim().toLowerCase() ||
    (phone ? syntheticEmailFromPhone(phone) : '');

  if (!email) {
    throw new Error('Email or phone is required');
  }

  if (users.some((user) => user.email === email)) {
    throw new Error('An account with this email already exists');
  }

  if (
    phone &&
    users.some((user) => user.phone && normalizePhone(user.phone) === phone)
  ) {
    throw new Error('An account with this phone number already exists');
  }

  const trimmedPassword = payload.password.trim();
  if (trimmedPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const user: DemoUserRecord = {
    id: `demo-user-${Date.now()}`,
    email,
    passwordHash: await hashPassword(trimmedPassword),
    phone: phone || null,
    firstName: payload.firstName?.trim() || null,
    lastName: payload.lastName?.trim() || null,
    vehicleIdentifierType: payload.vehicleIdentifierType ?? null,
    vehicleIdentifier: payload.vehicleIdentifier?.trim().toUpperCase() || null,
    dealerId: payload.dealerId?.trim() || null,
    dealerName: payload.dealerName?.trim() || null,
  };

  writeDemoUsers([...users, user]);
  return demoAuthResponse(user);
}

async function demoLogin(payload: LoginPayload): Promise<AuthResponse> {
  const user = findDemoUserByLogin(payload.login, readDemoUsers());

  if (!user || !(await verifyPassword(payload.password.trim(), user.passwordHash))) {
    throw new Error('Invalid login or password');
  }

  return demoAuthResponse(user);
}

async function demoMe(): Promise<UserProfile> {
  const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
  const user = readDemoUsers().find((item) => item.id === sessionId);

  if (!user) {
    throw new Error('Session expired');
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    vehicleIdentifierType: user.vehicleIdentifierType ?? null,
    vehicleIdentifier: user.vehicleIdentifier ?? null,
    dealerId: user.dealerId ?? null,
    dealerName: user.dealerName ?? null,
  };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (isDemoDataMode()) {
    return demoRegister(payload);
  }

  const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Registration failed'));
  }

  const data = (await res.json()) as AuthResponse;
  setAuthToken(data.accessToken);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (isDemoDataMode()) {
    return demoLogin(payload);
  }

  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Login failed'));
  }

  const data = (await res.json()) as AuthResponse;
  setAuthToken(data.accessToken);
  return data;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  if (isDemoDataMode()) {
    return demoMe();
  }

  const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    setAuthToken(null);
    throw new Error('Session expired');
  }

  return res.json();
}

export function logout(): void {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.demoSession);
  }
}

export function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
