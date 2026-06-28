import { PrismaClient } from '@prisma/client';



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

    answer: 'Fill in the form on the Test Drive page or call the dealer at Name name.',

    category: 'purchase',

    sortOrder: 1,

  },

  {

    question: 'What payment methods are available?',

    answer: 'Cash and bank transfer, plus finance and leasing through partner banks.',

    category: 'purchase',

    sortOrder: 2,

  },

  {

    question: 'How often should I service my car?',

    answer: 'Scheduled maintenance every 10,000 miles or once a year, whichever comes first.',

    category: 'service',

    sortOrder: 3,

  },

];



async function main() {

  const prisma = new PrismaClient();



  await prisma.carVariantOption.deleteMany();

  await prisma.configuration.deleteMany();

  await prisma.carVariant.deleteMany();

  await prisma.option.deleteMany();

  await prisma.booking.deleteMany();

  await prisma.review.deleteMany();

  await prisma.car.deleteMany();

  await prisma.fAQ.deleteMany();

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



  await prisma.promotion.create({

    data: {

      title: 'Swift Savings',

      description: 'Special offer on the Suzuki Swift — available until the end of the month.',

      isActive: true,

    },

  });



  await prisma.blogPost.createMany({

    data: [

      {

        slug: 'vitara-overview',

        title: 'Suzuki Vitara 2025 Overview',

        excerpt: 'What is new in the popular Suzuki crossover.',

        content: 'The Suzuki Vitara remains one of the most popular crossovers in its class...',

        isPublished: true,

        publishedAt: new Date(),

      },

      {

        slug: 'winter-service-tips',

        title: 'Preparing Your Car for Winter',

        excerpt: 'Maintenance tips before the cold season.',

        content: 'Before winter we recommend checking the battery, tyres and fluids...',

        isPublished: true,

        publishedAt: new Date(),

      },

    ],

  });



  console.log(`Seeded ${cars.length} cars`);

  await prisma.$disconnect();

}



main().catch(async (error) => {

  console.error(error);

  process.exit(1);

});

