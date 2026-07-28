/**
 * Static demo content for GitHub Pages / NEXT_PUBLIC_USE_DEMO_DATA builds.
 * Mirrors backend/prisma/seed.ts so the public preview matches Docker demo.
 */

export type DemoHomeBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  imageDesktop: string;
  imageMobile: string | null;
  sortOrder: number;
};

export type DemoFaqEntry = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
};

export type DemoBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  content: string;
};

export const DEMO_HOME_BANNERS: DemoHomeBanner[] = [
  {
    id: 'demo-banner-1',
    title: 'Warranty Service',
    subtitle: 'at official dealers',
    description: 'Current manufacturer warranty obligations.',
    imageDesktop:
      'https://img.perxis.ru/unsafe/2200x0/prxs/originals/cnpdfranifss73cb3u9g/original',
    imageMobile:
      'https://img.perxis.ru/unsafe/1200x0/prxs/originals/cnpdfranifss73cb3u9g/original',
    linkUrl: '/service',
    linkLabel: 'Learn More',
    sortOrder: 0,
  },
  {
    id: 'demo-banner-2',
    title: 'Warranty Service',
    subtitle: 'at official dealers',
    description: 'Current manufacturer warranty obligations.',
    imageDesktop:
      'https://img.perxis.ru/unsafe/2200x0/prxs/originals/cnpdgj2nifss73cb3udg/original',
    imageMobile:
      'https://img.perxis.ru/unsafe/1200x0/prxs/originals/cnpdgj2nifss73cb3udg/original',
    linkUrl: '/service',
    linkLabel: 'Learn More',
    sortOrder: 1,
  },
  {
    id: 'demo-banner-3',
    title: 'Warranty Service',
    subtitle: 'at official dealers',
    description: 'Current manufacturer warranty obligations.',
    imageDesktop:
      'https://img.perxis.ru/unsafe/1660x0/prxs/originals/cnpdfranifss73cb3ua0/original',
    imageMobile:
      'https://img.perxis.ru/unsafe/1000x0/prxs/originals/cnpdfranifss73cb3ua0/original',
    linkUrl: '/service',
    linkLabel: 'Learn More',
    sortOrder: 2,
  },
];

export const DEMO_FAQ_ENTRIES: DemoFaqEntry[] = [
  {
    id: 'demo-faq-1',
    question: 'How do I book a test drive?',
    answer:
      'Open the Test Drive page, pick a model and time slot, then submit the form. We will confirm by phone or email.',
    category: 'purchase',
    sortOrder: 1,
  },
  {
    id: 'demo-faq-2',
    question: 'What payment methods are available?',
    answer:
      'Cash and bank transfer are accepted. Finance and leasing are available through partner banks — see the Finance calculator.',
    category: 'purchase',
    sortOrder: 2,
  },
  {
    id: 'demo-faq-3',
    question: 'How often should I service my car?',
    answer:
      'Scheduled maintenance every 10,000 miles or once a year, whichever comes first. Book online via Service.',
    category: 'service',
    sortOrder: 3,
  },
  {
    id: 'demo-faq-4',
    question: 'Do you sell used Suzuki vehicles?',
    answer:
      'Yes. Browse approved used stock under Catalog → Used. Each listing shows mileage, year and price in USD.',
    category: 'purchase',
    sortOrder: 4,
  },
  {
    id: 'demo-faq-5',
    question: 'Can I configure a car online?',
    answer:
      'Yes. Use the Configurator to choose trim, colour and options. You can save the configuration to your account.',
    category: 'purchase',
    sortOrder: 5,
  },
  {
    id: 'demo-faq-6',
    question: 'How does dealer finance work?',
    answer:
      'Enter the vehicle price and deposit on the Finance page for an indicative monthly payment in USD. Final offers are confirmed by a manager.',
    category: 'finance',
    sortOrder: 6,
  },
  {
    id: 'demo-faq-7',
    question: 'What warranty do new cars include?',
    answer:
      'New Suzuki vehicles include the manufacturer warranty as stated in the handbook. Ask a salesperson for coverage details on your chosen model.',
    category: 'purchase',
    sortOrder: 7,
  },
  {
    id: 'demo-faq-8',
    question: 'Can I cancel a test drive booking?',
    answer:
      'Yes. Sign in to your account, open Bookings, and cancel the upcoming test drive. Please cancel as early as possible.',
    category: 'purchase',
    sortOrder: 8,
  },
  {
    id: 'demo-faq-9',
    question: 'Do I need an account to book service?',
    answer:
      'You can submit a service request without an account. Creating an account lets you track status and saved configurations.',
    category: 'service',
    sortOrder: 9,
  },
  {
    id: 'demo-faq-10',
    question: 'Where is the dealership located?',
    answer:
      'See Dealers for addresses, phone numbers and opening hours. The map page lists all locations.',
    category: 'general',
    sortOrder: 10,
  },
  {
    id: 'demo-faq-11',
    question: 'How do I reset my password?',
    answer:
      'On the login page choose Forgot password and enter your email. You will receive a reset link if the address is registered.',
    category: 'account',
    sortOrder: 11,
  },
  {
    id: 'demo-faq-12',
    question: 'Is SMS verification required?',
    answer:
      'Phone verification is available when SMS is configured. In demo mode codes may be echoed in the API response for testing.',
    category: 'account',
    sortOrder: 12,
  },
  {
    id: 'demo-faq-13',
    question: 'What is included in a service visit?',
    answer:
      'Typical visits cover oil and filters, safety checks and manufacturer schedule items. Extra work is quoted before starting.',
    category: 'service',
    sortOrder: 13,
  },
  {
    id: 'demo-faq-14',
    question: 'Can I request a price quote for a configuration?',
    answer:
      'Yes. From the configurator or car page open Request a quote. A manager will follow up with a formal offer.',
    category: 'purchase',
    sortOrder: 14,
  },
  {
    id: 'demo-faq-15',
    question: 'Do you offer trade-in?',
    answer:
      'Trade-in can be discussed with a sales manager. Bring your vehicle documents and service history when you visit.',
    category: 'purchase',
    sortOrder: 15,
  },
  {
    id: 'demo-faq-16',
    question: 'How long are saved configurations kept?',
    answer:
      'Saved configurations expire after a few days if unused. Sign in regularly or request a quote to keep your build active.',
    category: 'account',
    sortOrder: 16,
  },
  {
    id: 'demo-faq-17',
    question: 'Are prices shown in USD?',
    answer:
      'Yes. Catalogue and finance figures use USD for this market build. Taxes and fees may apply at purchase.',
    category: 'finance',
    sortOrder: 17,
  },
  {
    id: 'demo-faq-18',
    question: 'How do I contact a manager?',
    answer:
      'Use the Contacts form, call the dealer phone number, or ask the on-site chat agent to escalate your request.',
    category: 'general',
    sortOrder: 18,
  },
  {
    id: 'demo-faq-19',
    question: 'Is the online chat answered by AI?',
    answer:
      'Yes. The chat agent can check inventory, FAQ, finance estimates and dealer info. It can also escalate to a human manager.',
    category: 'general',
    sortOrder: 19,
  },
  {
    id: 'demo-faq-20',
    question: 'Can I visit without an appointment?',
    answer:
      'Walk-ins are welcome during opening hours. Booking a test drive or service slot online helps us prepare for your visit.',
    category: 'general',
    sortOrder: 20,
  },
];

const PUBLISHED_AT = '2026-01-15T10:00:00.000Z';

export const DEMO_BLOG_POSTS: DemoBlogPost[] = [
  {
    id: 'demo-blog-1',
    slug: 'vitara-overview',
    title: 'Suzuki Vitara 2025 Overview',
    excerpt: 'What is new in the popular Suzuki crossover.',
    coverImage: null,
    publishedAt: PUBLISHED_AT,
    content:
      'The Suzuki Vitara remains one of the most popular crossovers in its class. Visit our showroom to compare trims, colours and options, or build your own in the online configurator.',
  },
  {
    id: 'demo-blog-2',
    slug: 'winter-service-tips',
    title: 'Preparing Your Car for Winter',
    excerpt: 'Maintenance tips before the cold season.',
    coverImage: null,
    publishedAt: PUBLISHED_AT,
    content:
      'Before winter we recommend checking the battery, tyres and fluids. Book a seasonal service online and our technicians will run through the manufacturer checklist.',
  },
  {
    id: 'demo-blog-3',
    slug: 'jimny-lifestyle',
    title: 'Why Drivers Love the Jimny',
    excerpt: 'Compact size, serious capability.',
    coverImage: null,
    publishedAt: PUBLISHED_AT,
    content:
      'The Jimny pairs city-friendly dimensions with genuine off-road hardware. Explore available stock in the catalogue or arrange a test drive to feel the four-wheel-drive character first-hand.',
  },
  {
    id: 'demo-blog-4',
    slug: 'finance-explained',
    title: 'Understanding Dealer Finance',
    excerpt: 'How indicative quotes work on our site.',
    coverImage: null,
    publishedAt: PUBLISHED_AT,
    content:
      'Our finance calculator shows estimated monthly payments in USD based on price, deposit and term. Final rates depend on credit approval and partner bank offers — ask a manager for a formal quote.',
  },
  {
    id: 'demo-blog-5',
    slug: 'swift-city-driving',
    title: 'Suzuki Swift for City Driving',
    excerpt: 'Agile hatchback for everyday trips.',
    coverImage: null,
    publishedAt: PUBLISHED_AT,
    content:
      'The Swift is designed for efficient urban driving with a compact footprint and responsive handling. Compare new and offer stock online, then book a test drive when you are ready.',
  },
  {
    id: 'demo-blog-6',
    slug: 'service-booking-guide',
    title: 'How to Book Service Online',
    excerpt: 'A short guide to service appointments.',
    coverImage: null,
    publishedAt: PUBLISHED_AT,
    content:
      'Choose Service in the main menu, select a slot that fits your schedule and describe the work needed. You will receive a confirmation and can track the booking from your account.',
  },
];
