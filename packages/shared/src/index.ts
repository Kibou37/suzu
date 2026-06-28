/** Dealer placeholders — docs/kickoff/contacts.md */
export const dealer = {
  name: 'Name name',
  address: '123 Dealer Avenue, London, UK',
  phone: '+44 (0) 20 0000 0000',
  email: 'info@name-name.com',
  workingHours: 'Mon–Sat: 9:00 AM–8:00 PM, Sun: 10:00 AM–6:00 PM',
} as const;

export const brand = {
  primaryColor: '#00368f',
  accentColor: '#de0039',
  name: 'Suzuki',
} as const;

export const apiRoutes = {
  health: '/api/health',
  cars: '/api/cars',
} as const;

export const navItems = [
  { href: '/catalog', label: 'Automobiles' },
  { href: '/service', label: 'Support' },
  { href: '/contacts', label: 'Dealers' },
  { href: '/blog', label: 'News' },
  { href: '/account', label: 'My Account' },
] as const;

export type NavItem = (typeof navItems)[number];

export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
};
