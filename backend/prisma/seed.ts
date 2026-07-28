import { BookingType, PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { generateServiceSlotsForDay } from '../src/bookings/booking-slots.util';

const TEST_ACCOUNT = {
  email: 'demo@suzuki.local',
  password: 'Demo1234',
  phone: '+447000900123',
  firstName: 'James',
  lastName: 'Smith',
};

const ADMIN_ACCOUNT = {
  email: 'admin@suzuki.local',
  password: 'Admin1234',
  firstName: 'Site',
  lastName: 'Admin',
};

const CONTENT_ACCOUNT = {
  email: 'content@suzuki.local',
  password: 'Content1234',
  firstName: 'Content',
  lastName: 'Manager',
};

const DEALER_ACCOUNT = {
  email: 'dealer@suzuki.local',
  password: 'Dealer1234',
  firstName: 'Dealer',
  lastName: 'Manager',
};

const cars = [
  {
    slug: 'vitara',

    name: 'Vitara',

    condition: 'NEW' as const,

    year: 2025,

    price: 24900,

    bodyType: 'SUV' as const,

    fuelType: 'PETROL' as const,

    transmission: 'AUTOMATIC' as const,

    trim: 'GLX',

    description: 'The compact Suzuki Vitara crossover — a versatile choice for city and country driving.',

    horsepower: 102,

    isFeatured: true,

    images: ['/images/cars/vitara.jpg', '/images/cars/vitara-logo.png'],

    variants: [{ name: 'GLX', basePrice: 24900 }],

  },

  {

    slug: 'jimny',

    name: 'Jimny',

    condition: 'NEW' as const,

    year: 2025,

    price: 21900,

    bodyType: 'SUV' as const,

    fuelType: 'PETROL' as const,

    transmission: 'MANUAL' as const,

    trim: 'Heritage',

    description: 'The legendary Suzuki Jimny with a ladder-frame chassis and full-time 4WD.',

    horsepower: 102,

    isFeatured: true,

    images: ['/images/cars/jimny.jpg', '/images/cars/jimny-logo.png'],

    variants: [{ name: 'Heritage', basePrice: 21900 }],

  },

  {

    slug: 'swift',

    name: 'Swift',

    condition: 'NEW' as const,

    year: 2024,

    price: 15900,

    bodyType: 'HATCHBACK' as const,

    fuelType: 'PETROL' as const,

    transmission: 'CVT' as const,

    trim: 'Comfort',

    description: 'The Suzuki Swift city hatchback — economical, agile and fun to drive.',

    horsepower: 83,

    isFeatured: true,

    images: ['/images/cars/swift.jpg', '/images/cars/swift-logo.png'],

    variants: [{ name: 'Comfort', basePrice: 15900 }],

  },

  {

    slug: 's-cross',

    name: 'S-Cross',

    condition: 'NEW' as const,

    year: 2025,

    price: 26900,

    bodyType: 'CROSSOVER' as const,

    fuelType: 'HYBRID' as const,

    transmission: 'CVT' as const,

    trim: 'Premium',

    description: 'The Suzuki S-Cross crossover with a hybrid powertrain for efficiency and comfort.',

    horsepower: 115,

    isFeatured: false,

    images: ['/images/cars/s-cross.jpg', '/images/cars/s-cross-logo.png'],

    variants: [{ name: 'Premium', basePrice: 26900 }],

  },

  {

    slug: 'vitara-used',

    name: 'Vitara',

    condition: 'USED' as const,

    year: 2021,

    price: 18900,

    mileage: 42000,

    bodyType: 'SUV' as const,

    fuelType: 'PETROL' as const,

    transmission: 'AUTOMATIC' as const,

    trim: 'GL',

    description: 'Pre-owned Suzuki Vitara in excellent condition.',

    horsepower: 102,

    isFeatured: false,

    images: ['/images/cars/vitara.jpg', '/images/cars/vitara-logo.png'],

    variants: [{ name: 'GL', basePrice: 18900 }],

  },

  {

    slug: 'swift-offer',

    name: 'Swift',

    condition: 'NEW' as const,

    year: 2024,

    price: 14900,

    bodyType: 'HATCHBACK' as const,

    fuelType: 'PETROL' as const,

    transmission: 'CVT' as const,

    trim: 'Special',

    description: 'Special offer on the Suzuki Swift — limited availability.',

    horsepower: 83,

    isFeatured: false,

    isOffer: true,

    offerLabel: '-10%',

    images: ['/images/cars/swift.jpg', '/images/cars/swift-logo.png'],

    variants: [{ name: 'Special', basePrice: 14900 }],

  },

];



const faqs = [
  {
    question: 'How do I book a test drive?',
    answer:
      'Open the Test Drive page, pick a model and time slot, then submit the form. We will confirm by phone or email.',
    category: 'purchase',
    sortOrder: 1,
  },
  {
    question: 'What payment methods are available?',
    answer:
      'Cash and bank transfer are accepted. Finance and leasing are available through partner banks — see the Finance calculator.',
    category: 'purchase',
    sortOrder: 2,
  },
  {
    question: 'How often should I service my car?',
    answer:
      'Scheduled maintenance every 10,000 miles or once a year, whichever comes first. Book online via Service.',
    category: 'service',
    sortOrder: 3,
  },
  {
    question: 'Do you sell used Suzuki vehicles?',
    answer:
      'Yes. Browse approved used stock under Catalog → Used. Each listing shows mileage, year and price in USD.',
    category: 'purchase',
    sortOrder: 4,
  },
  {
    question: 'Can I configure a car online?',
    answer:
      'Yes. Use the Configurator to choose trim, colour and options. You can save the configuration to your account.',
    category: 'purchase',
    sortOrder: 5,
  },
  {
    question: 'How does dealer finance work?',
    answer:
      'Enter the vehicle price and deposit on the Finance page for an indicative monthly payment in USD. Final offers are confirmed by a manager.',
    category: 'finance',
    sortOrder: 6,
  },
  {
    question: 'What warranty do new cars include?',
    answer:
      'New Suzuki vehicles include the manufacturer warranty as stated in the handbook. Ask a salesperson for coverage details on your chosen model.',
    category: 'purchase',
    sortOrder: 7,
  },
  {
    question: 'Can I cancel a test drive booking?',
    answer:
      'Yes. Sign in to your account, open Bookings, and cancel the upcoming test drive. Please cancel as early as possible.',
    category: 'purchase',
    sortOrder: 8,
  },
  {
    question: 'Do I need an account to book service?',
    answer:
      'You can submit a service request without an account. Creating an account lets you track status and saved configurations.',
    category: 'service',
    sortOrder: 9,
  },
  {
    question: 'Where is the dealership located?',
    answer:
      'See Dealers for addresses, phone numbers and opening hours. The map page lists all locations.',
    category: 'general',
    sortOrder: 10,
  },
  {
    question: 'How do I reset my password?',
    answer:
      'On the login page choose Forgot password and enter your email. You will receive a reset link if the address is registered.',
    category: 'account',
    sortOrder: 11,
  },
  {
    question: 'Is SMS verification required?',
    answer:
      'Phone verification is available when SMS is configured. In demo mode codes may be echoed in the API response for testing.',
    category: 'account',
    sortOrder: 12,
  },
  {
    question: 'What is included in a service visit?',
    answer:
      'Typical visits cover oil and filters, safety checks and manufacturer schedule items. Extra work is quoted before starting.',
    category: 'service',
    sortOrder: 13,
  },
  {
    question: 'Can I request a price quote for a configuration?',
    answer:
      'Yes. From the configurator or car page open Request a quote. A manager will follow up with a formal offer.',
    category: 'purchase',
    sortOrder: 14,
  },
  {
    question: 'Do you offer trade-in?',
    answer:
      'Trade-in can be discussed with a sales manager. Bring your vehicle documents and service history when you visit.',
    category: 'purchase',
    sortOrder: 15,
  },
  {
    question: 'How long are saved configurations kept?',
    answer:
      'Saved configurations expire after a few days if unused. Sign in regularly or request a quote to keep your build active.',
    category: 'account',
    sortOrder: 16,
  },
  {
    question: 'Are prices shown in USD?',
    answer:
      'Yes. Catalogue and finance figures use USD for this market build. Taxes and fees may apply at purchase.',
    category: 'finance',
    sortOrder: 17,
  },
  {
    question: 'How do I contact a manager?',
    answer:
      'Use the Contacts form, call the dealer phone number, or ask the on-site chat agent to escalate your request.',
    category: 'general',
    sortOrder: 18,
  },
  {
    question: 'Is the online chat answered by AI?',
    answer:
      'Yes. The chat agent can check inventory, FAQ, finance estimates and dealer info. It can also escalate to a human manager.',
    category: 'general',
    sortOrder: 19,
  },
  {
    question: 'Can I visit without an appointment?',
    answer:
      'Walk-ins are welcome during opening hours. Booking a test drive or service slot online helps us prepare for your visit.',
    category: 'general',
    sortOrder: 20,
  },
];



async function main() {
  // This seed wipes tables and creates well-known demo/admin passwords —
  // never let it run against a real production database by accident.
  if (process.env.NODE_ENV === 'production' && process.env.SEED_ALLOW_PROD !== 'true') {
    throw new Error(
      'Refusing to run demo seed against NODE_ENV=production. ' +
        'Set SEED_ALLOW_PROD=true if you really intend to seed this database.',
    );
  }

  const prisma = new PrismaClient();



  await prisma.carVariantOption.deleteMany();

  await prisma.configuration.deleteMany();

  await prisma.serviceSlot.deleteMany();

  await prisma.carVariant.deleteMany();

  await prisma.option.deleteMany();

  await prisma.booking.deleteMany();

  await prisma.review.deleteMany();

  await prisma.car.deleteMany();

  await prisma.fAQ.deleteMany();

  await prisma.homeBanner.deleteMany();

  await prisma.promotion.deleteMany();

  await prisma.blogPost.deleteMany();



  for (const car of cars) {

    const { variants, ...carData } = car;

    await prisma.car.create({

      data: {

        ...carData,

        variants: {

          create: variants,

        },

      },

    });

  }



  await prisma.fAQ.createMany({ data: faqs });



  await prisma.homeBanner.createMany({
    data: [
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
      {
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
        isActive: true,
      },
    ],
  });

  await prisma.promotion.createMany({
    data: [
      {
        title: 'Swift Savings',
        subtitle: 'limited-time offer',
        description: 'Special offer on the Suzuki Swift — available until the end of the month.',
        image: 'https://img.perxis.ru/unsafe/2200x0/prxs/originals/cnpdgj2nifss73cb3udg/original',
        linkUrl: '/catalog/offers',
        isActive: true,
      },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        slug: 'vitara-overview',
        title: 'Suzuki Vitara 2025 Overview',
        excerpt: 'What is new in the popular Suzuki crossover.',
        content:
          'The Suzuki Vitara remains one of the most popular crossovers in its class. Visit our showroom to compare trims, colours and options, or build your own in the online configurator.',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: 'winter-service-tips',
        title: 'Preparing Your Car for Winter',
        excerpt: 'Maintenance tips before the cold season.',
        content:
          'Before winter we recommend checking the battery, tyres and fluids. Book a seasonal service online and our technicians will run through the manufacturer checklist.',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: 'jimny-lifestyle',
        title: 'Why Drivers Love the Jimny',
        excerpt: 'Compact size, serious capability.',
        content:
          'The Jimny pairs city-friendly dimensions with genuine off-road hardware. Explore available stock in the catalogue or arrange a test drive to feel the four-wheel-drive character first-hand.',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: 'finance-explained',
        title: 'Understanding Dealer Finance',
        excerpt: 'How indicative quotes work on our site.',
        content:
          'Our finance calculator shows estimated monthly payments in USD based on price, deposit and term. Final rates depend on credit approval and partner bank offers — ask a manager for a formal quote.',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: 'swift-city-driving',
        title: 'Suzuki Swift for City Driving',
        excerpt: 'Agile hatchback for everyday trips.',
        content:
          'The Swift is designed for efficient urban driving with a compact footprint and responsive handling. Compare new and offer stock online, then book a test drive when you are ready.',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: 'service-booking-guide',
        title: 'How to Book Service Online',
        excerpt: 'A short guide to service appointments.',
        content:
          'Choose Service in the main menu, select a slot that fits your schedule and describe the work needed. You will receive a confirmation and can track the booking from your account.',
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });



  console.log(`Seeded ${cars.length} cars`);

  const passwordHash = await hash(TEST_ACCOUNT.password, 12);
  const testUser = await prisma.user.upsert({
    where: { email: TEST_ACCOUNT.email },
    update: {
      passwordHash,
      phone: TEST_ACCOUNT.phone,
      firstName: TEST_ACCOUNT.firstName,
      lastName: TEST_ACCOUNT.lastName,
      vehicleIdentifierType: 'VIN',
      vehicleIdentifier: 'JS2ZC63S004123456',
      dealerId: 'name-name-london',
      dealerName: 'Name name',
    },
    create: {
      email: TEST_ACCOUNT.email,
      passwordHash,
      phone: TEST_ACCOUNT.phone,
      firstName: TEST_ACCOUNT.firstName,
      lastName: TEST_ACCOUNT.lastName,
      vehicleIdentifierType: 'VIN',
      vehicleIdentifier: 'JS2ZC63S004123456',
      dealerId: 'name-name-london',
      dealerName: 'Name name',
    },
  });

  const adminPasswordHash = await hash(ADMIN_ACCOUNT.password, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_ACCOUNT.email },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      firstName: ADMIN_ACCOUNT.firstName,
      lastName: ADMIN_ACCOUNT.lastName,
    },
    create: {
      email: ADMIN_ACCOUNT.email,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      firstName: ADMIN_ACCOUNT.firstName,
      lastName: ADMIN_ACCOUNT.lastName,
    },
  });
  console.log(`Seeded admin account: ${ADMIN_ACCOUNT.email}`);

  const contentPasswordHash = await hash(CONTENT_ACCOUNT.password, 12);
  await prisma.user.upsert({
    where: { email: CONTENT_ACCOUNT.email },
    update: {
      passwordHash: contentPasswordHash,
      role: Role.CONTENT_MANAGER,
      firstName: CONTENT_ACCOUNT.firstName,
      lastName: CONTENT_ACCOUNT.lastName,
    },
    create: {
      email: CONTENT_ACCOUNT.email,
      passwordHash: contentPasswordHash,
      role: Role.CONTENT_MANAGER,
      firstName: CONTENT_ACCOUNT.firstName,
      lastName: CONTENT_ACCOUNT.lastName,
    },
  });
  console.log(`Seeded content manager: ${CONTENT_ACCOUNT.email}`);

  const dealerPasswordHash = await hash(DEALER_ACCOUNT.password, 12);
  await prisma.user.upsert({
    where: { email: DEALER_ACCOUNT.email },
    update: {
      passwordHash: dealerPasswordHash,
      role: Role.DEALER_MANAGER,
      firstName: DEALER_ACCOUNT.firstName,
      lastName: DEALER_ACCOUNT.lastName,
    },
    create: {
      email: DEALER_ACCOUNT.email,
      passwordHash: dealerPasswordHash,
      role: Role.DEALER_MANAGER,
      firstName: DEALER_ACCOUNT.firstName,
      lastName: DEALER_ACCOUNT.lastName,
    },
  });
  console.log(`Seeded dealer manager: ${DEALER_ACCOUNT.email}`);

  await prisma.booking.deleteMany({ where: { userId: testUser.id } });

  const vitara = await prisma.car.findUnique({ where: { slug: 'vitara' } });
  const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await prisma.booking.createMany({
    data: [
      {
        type: 'TEST_DRIVE',
        status: 'CONFIRMED',
        userId: testUser.id,
        carId: vitara?.id ?? null,
        scheduledAt: inOneWeek,
        customerName: `${TEST_ACCOUNT.firstName} ${TEST_ACCOUNT.lastName}`,
        customerPhone: TEST_ACCOUNT.phone,
        customerEmail: TEST_ACCOUNT.email,
        notes: 'Interested in Vitara GLX trim',
      },
      {
        type: 'SERVICE',
        status: 'PENDING',
        userId: testUser.id,
        scheduledAt: inTwoWeeks,
        customerName: `${TEST_ACCOUNT.firstName} ${TEST_ACCOUNT.lastName}`,
        customerPhone: TEST_ACCOUNT.phone,
        customerEmail: TEST_ACCOUNT.email,
        notes: 'Annual service',
      },
    ],
  });

  const slotRows: Array<{
    startsAt: Date;
    endsAt: Date;
    type: (typeof BookingType)[keyof typeof BookingType];
    maxBookings: number;
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 90; offset += 1) {
    const day = new Date(today);
    day.setDate(day.getDate() + offset);
    slotRows.push(
      ...generateServiceSlotsForDay(day, [
        BookingType.TEST_DRIVE,
        BookingType.SERVICE,
      ]),
    );
  }

  await prisma.serviceSlot.createMany({ data: slotRows, skipDuplicates: true });

  console.log(`Seeded ${slotRows.length} service slots`);

  console.log(`Seeded test account: ${TEST_ACCOUNT.email}`);

  await prisma.$disconnect();

}



main().catch(async (error) => {

  console.error(error);

  process.exit(1);

});

