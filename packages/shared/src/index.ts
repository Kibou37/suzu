/** Dealer placeholders — docs/kickoff/contacts.md */

export const dealerServices = [
  { id: 'sales', label: 'Automobiles' },
  { id: 'service', label: 'Service & parts' },
  { id: 'motorcycles', label: 'Motorcycles' },
] as const;

export type DealerServiceId = (typeof dealerServices)[number]['id'];

export type DealerLocation = {
  lat: number;
  lng: number;
};

export type Dealer = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  workingHours: string;
  services: readonly DealerServiceId[];
  location: DealerLocation;
};

export const dealers: readonly Dealer[] = [
  {
    id: 'name-name-london',
    name: 'Name name',
    city: 'London',
    address: '123 Dealer Avenue, London, UK',
    phone: '+44 (0) 20 0000 0000',
    email: 'info@name-name.com',
    workingHours: 'Mon–Sat: 9:00 AM–8:00 PM, Sun: 10:00 AM–6:00 PM',
    services: ['sales', 'service'],
    location: { lat: 51.5074, lng: -0.1278 },
  },
  {
    id: 'suzuki-birmingham',
    name: 'Suzuki Birmingham',
    city: 'Birmingham',
    address: '45 High Street, Birmingham, B1 1AA',
    phone: '+44 (0) 121 000 0000',
    email: 'birmingham@suzuki-demo.local',
    workingHours: 'Mon–Sat: 9:00 AM–7:00 PM, Sun: 10:00 AM–5:00 PM',
    services: ['sales', 'service'],
    location: { lat: 52.4862, lng: -1.8904 },
  },
  {
    id: 'suzuki-manchester',
    name: 'Suzuki Manchester',
    city: 'Manchester',
    address: '12 Deansgate, Manchester, M3 2EN',
    phone: '+44 (0) 161 000 0000',
    email: 'manchester@suzuki-demo.local',
    workingHours: 'Mon–Fri: 9:00 AM–7:00 PM, Sat: 9:00 AM–6:00 PM',
    services: ['sales', 'service', 'motorcycles'],
    location: { lat: 53.4808, lng: -2.2426 },
  },
  {
    id: 'suzuki-bristol',
    name: 'Suzuki Bristol',
    city: 'Bristol',
    address: '8 Temple Quay, Bristol, BS1 6DG',
    phone: '+44 (0) 117 000 0000',
    email: 'bristol@suzuki-demo.local',
    workingHours: 'Mon–Sat: 9:00 AM–6:30 PM',
    services: ['sales', 'service'],
    location: { lat: 51.4545, lng: -2.5879 },
  },
  {
    id: 'suzuki-edinburgh',
    name: 'Suzuki Edinburgh',
    city: 'Edinburgh',
    address: '22 Princes Street, Edinburgh, EH2 2AN',
    phone: '+44 (0) 131 000 0000',
    email: 'edinburgh@suzuki-demo.local',
    workingHours: 'Mon–Sat: 9:00 AM–6:00 PM, Sun: 11:00 AM–4:00 PM',
    services: ['sales'],
    location: { lat: 55.9533, lng: -3.1883 },
  },
  {
    id: 'suzuki-leeds',
    name: 'Suzuki Leeds',
    city: 'Leeds',
    address: '5 Briggate, Leeds, LS1 6HD',
    phone: '+44 (0) 113 000 0000',
    email: 'leeds@suzuki-demo.local',
    workingHours: 'Mon–Sat: 8:30 AM–7:00 PM',
    services: ['service', 'motorcycles'],
    location: { lat: 53.8008, lng: -1.5491 },
  },
] as const;

/** Primary dealer used in footer / schema placeholders */
export const dealer = {
  name: dealers[0].name,
  address: dealers[0].address,
  phone: dealers[0].phone,
  email: dealers[0].email ?? 'info@name-name.com',
  workingHours: dealers[0].workingHours,
  location: dealers[0].location,
} as const;

export type DealerOption = (typeof dealers)[number];

export function getDealerServiceLabel(id: DealerServiceId): string {
  return dealerServices.find((item) => item.id === id)?.label ?? id;
}

export const brand = {
  primaryColor: '#00368f',
  accentColor: '#de0039',
  name: 'Suzuki',
} as const;

export const apiRoutes = {
  health: '/api/health',
  cars: '/api/cars',
  bookings: '/api/bookings',
  quotes: '/api/quotes',
  auth: '/api/auth',
  account: '/api/account',
} as const;

export const navItems = [
  { href: '/catalog', label: 'Automobiles' },
  { href: '/finance', label: 'Finance' },
  { href: '/service', label: 'Support' },
  { href: '/dealers', label: 'Dealers' },
  { href: '/blog', label: 'News' },
  { href: '/account', label: 'My Account' },
] as const;

export type NavItem = (typeof navItems)[number];

export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
};
