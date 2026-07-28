import { apiUrl, parseApiError } from '@/lib/config';

export type AdminRole = 'ADMIN' | 'CONTENT_MANAGER' | 'DEALER_MANAGER';

export type AdminUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AdminRole;
};

export type AdminAuthResponse = {
  accessToken: string;
  user: AdminUser;
};

export type DashboardSummary = {
  cars: number;
  faqs: number;
  blogPosts: number;
  promotions: number;
  bookings: number;
  quoteRequests: number;
  pendingQuotes: number;
  quotesToday: number;
  upcomingTestDrives: number;
  activePromotions: number;
  pendingBookings: number;
  homeBanners: number;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
};

export type FaqInput = {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  isPublished?: boolean;
};

export type CarCondition = 'NEW' | 'USED';
export type BodyType = 'SEDAN' | 'SUV' | 'HATCHBACK' | 'CROSSOVER' | 'PICKUP';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'CVT';

export type AdminCarVariant = {
  id: string;
  name: string;
  basePrice: string | number;
};

export type AdminCar = {
  id: string;
  slug: string;
  name: string;
  condition: CarCondition;
  year: number;
  price: string | number;
  mileage: number;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  trim: string | null;
  description: string | null;
  horsepower: number | null;
  isFeatured: boolean;
  isOffer: boolean;
  offerLabel: string | null;
  images: string[];
  variants: AdminCarVariant[];
};

export type AdminCarInput = {
  name: string;
  slug?: string;
  condition: CarCondition;
  year: number;
  price: number;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  trim?: string;
  description?: string;
  mileage?: number;
  horsepower?: number;
  isFeatured?: boolean;
  isOffer?: boolean;
  offerLabel?: string;
  images?: string[];
  variantName?: string;
};

export type BookingType = 'TEST_DRIVE' | 'SERVICE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type AdminBooking = {
  id: string;
  type: BookingType;
  status: BookingStatus;
  scheduledAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  car: { name: string; slug: string } | null;
};

export type QuoteStatus = 'PENDING' | 'CONTACTED' | 'CLOSED';

export type AdminQuote = {
  id: string;
  status: QuoteStatus;
  carSlug: string;
  modelName: string;
  summary: string;
  totalPrice: string | number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string | null;
  dealerName: string;
  contactMethod: 'PHONE' | 'EMAIL' | 'EITHER';
  createdAt: string;
};

export type ServiceSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  type: BookingType;
  maxBookings: number;
  isBlocked: boolean;
};

export type ServiceSlotInput = {
  startsAt: string;
  type: BookingType;
  maxBookings?: number;
  isBlocked?: boolean;
};

export type Promotion = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  linkUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type PromotionInput = {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  linkUrl?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

const ADMIN_TOKEN_KEY = 'suzuki-admin-token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(apiUrl(path), { ...options, headers, cache: 'no-store' });

  if (res.status === 401 || res.status === 403) {
    if (res.status === 401) setAdminToken(null);
    const text = await res.text();
    throw new AdminApiError(parseApiError(text, 'Access denied'), res.status);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new AdminApiError(parseApiError(text, 'Request failed'), res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function adminLogin(login: string, password: string): Promise<AdminAuthResponse> {
  const data = await adminFetch<AdminAuthResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  });
  setAdminToken(data.accessToken);
  return data;
}

export function adminLogout(): void {
  setAdminToken(null);
}

export function fetchAdminMe(): Promise<AdminUser> {
  return adminFetch<AdminUser>('/api/admin/auth/me');
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return adminFetch<DashboardSummary>('/api/admin/dashboard');
}

export const faqApi = {
  list: () => adminFetch<FaqItem[]>('/api/admin/faq'),
  create: (input: FaqInput) =>
    adminFetch<FaqItem>('/api/admin/faq', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<FaqInput>) =>
    adminFetch<FaqItem>(`/api/admin/faq/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => adminFetch<{ deleted: boolean }>(`/api/admin/faq/${id}`, { method: 'DELETE' }),
};

export const blogApi = {
  list: () => adminFetch<BlogPost[]>('/api/admin/blog-posts'),
  create: (input: BlogPostInput) =>
    adminFetch<BlogPost>('/api/admin/blog-posts', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<BlogPostInput>) =>
    adminFetch<BlogPost>(`/api/admin/blog-posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    adminFetch<{ deleted: boolean }>(`/api/admin/blog-posts/${id}`, { method: 'DELETE' }),
};

export const carsApi = {
  list: (condition?: CarCondition) =>
    adminFetch<AdminCar[]>(`/api/admin/cars${condition ? `?condition=${condition}` : ''}`),
  create: (input: AdminCarInput) =>
    adminFetch<AdminCar>('/api/admin/cars', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<AdminCarInput>) =>
    adminFetch<AdminCar>(`/api/admin/cars/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => adminFetch<{ deleted: boolean }>(`/api/admin/cars/${id}`, { method: 'DELETE' }),
};

export const bookingsApi = {
  list: (filter?: { type?: BookingType; status?: BookingStatus }) => {
    const search = new URLSearchParams();
    if (filter?.type) search.set('type', filter.type);
    if (filter?.status) search.set('status', filter.status);
    const query = search.toString();
    return adminFetch<AdminBooking[]>(`/api/admin/bookings${query ? `?${query}` : ''}`);
  },
  updateStatus: (id: string, status: BookingStatus) =>
    adminFetch<AdminBooking>(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const quotesApi = {
  list: (status?: QuoteStatus) =>
    adminFetch<AdminQuote[]>(`/api/admin/quotes${status ? `?status=${status}` : ''}`),
  updateStatus: (id: string, status: QuoteStatus) =>
    adminFetch<AdminQuote>(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const slotsApi = {
  list: (from: Date, to: Date, type?: BookingType) => {
    const search = new URLSearchParams({ from: toDateOnly(from), to: toDateOnly(to) });
    if (type) search.set('type', type);
    return adminFetch<ServiceSlot[]>(`/api/bookings/admin/slots?${search.toString()}`);
  },
  upsert: (input: ServiceSlotInput) =>
    adminFetch<ServiceSlot>('/api/bookings/admin/slots', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: string, input: { maxBookings?: number; isBlocked?: boolean }) =>
    adminFetch<ServiceSlot>(`/api/bookings/admin/slots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};

export const promotionsApi = {
  list: () => adminFetch<Promotion[]>('/api/admin/promotions'),
  create: (input: PromotionInput) =>
    adminFetch<Promotion>('/api/admin/promotions', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<PromotionInput>) =>
    adminFetch<Promotion>(`/api/admin/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    adminFetch<{ deleted: boolean }>(`/api/admin/promotions/${id}`, { method: 'DELETE' }),
};

export type StaffUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AdminRole;
  phone: string | null;
  createdAt: string;
};

export const staffUsersApi = {
  list: () => adminFetch<StaffUser[]>('/api/admin/users'),
};

export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  imageDesktop: string;
  imageMobile: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type HomeBannerInput = {
  title: string;
  subtitle?: string;
  description?: string;
  linkUrl?: string;
  linkLabel?: string;
  imageDesktop: string;
  imageMobile?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export const homeBannersApi = {
  list: () => adminFetch<HomeBanner[]>('/api/admin/home-banners'),
  create: (input: HomeBannerInput) =>
    adminFetch<HomeBanner>('/api/admin/home-banners', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: string, input: Partial<HomeBannerInput>) =>
    adminFetch<HomeBanner>(`/api/admin/home-banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    adminFetch<{ deleted: boolean }>(`/api/admin/home-banners/${id}`, { method: 'DELETE' }),
};

export type MediaFolder = 'cars' | 'blog' | 'promotions' | 'banners';

export type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  originalName: string | null;
  folder: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
};

export type MediaUploadResult = {
  id?: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  folder?: string;
};

export const mediaApi = {
  list: (folder?: MediaFolder) => {
    const search = folder ? `?folder=${folder}` : '';
    return adminFetch<MediaAsset[]>(`/api/admin/media${search}`);
  },
  remove: (id: string) =>
    adminFetch<{ deleted: boolean; warning: string | null }>(`/api/admin/media/${id}`, {
      method: 'DELETE',
    }),
};

export async function uploadMedia(file: File, folder: MediaFolder = 'cars'): Promise<MediaUploadResult> {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(apiUrl(`/api/admin/media/upload?folder=${folder}`), {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    if (res.status === 401) setAdminToken(null);
    const text = await res.text();
    throw new AdminApiError(parseApiError(text, 'Access denied'), res.status);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new AdminApiError(parseApiError(text, 'Upload failed'), res.status);
  }

  return res.json() as Promise<MediaUploadResult>;
}
