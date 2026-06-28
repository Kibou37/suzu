const bodyTypeLabels: Record<string, string> = {

  SUV: 'SUV',

  HATCHBACK: 'Hatchback',

  CROSSOVER: 'Crossover',

  SEDAN: 'Sedan',

  WAGON: 'Wagon',

};



const fuelTypeLabels: Record<string, string> = {

  PETROL: 'Petrol',

  DIESEL: 'Diesel',

  HYBRID: 'Hybrid',

  ELECTRIC: 'Electric',

};



const transmissionLabels: Record<string, string> = {

  MANUAL: 'Manual',

  AUTOMATIC: 'Automatic',

  CVT: 'CVT',

};



export function formatPrice(value: string | number): string {

  return Number(value).toLocaleString('en-US', {

    style: 'currency',

    currency: 'USD',

    maximumFractionDigits: 0,

  });

}



export function formatBodyType(value: string): string {

  return bodyTypeLabels[value] ?? value;

}



export function formatFuelType(value: string): string {

  return fuelTypeLabels[value] ?? value;

}



export function formatTransmission(value: string): string {

  return transmissionLabels[value] ?? value;

}

