import { brand, dealer } from '@suzuki/shared';
import { absoluteUrl } from '@/lib/seo';

/**
 * JSON.stringify does not escape `<`, so admin-editable text containing
 * `</script>` could break out of the JSON-LD script tag and execute as
 * markup/script on the page. Escaping `<` as a unicode sequence keeps the
 * JSON semantically identical while making it safe to inline in HTML.
 */
export function safeJsonLdStringify(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Organization + AutoDealer JSON-LD for the primary dealer. */
export function dealerJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'AutoDealer'],
    name: dealer.name,
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    url: absoluteUrl('/'),
    telephone: dealer.phone,
    email: dealer.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: dealer.location.lat,
      longitude: dealer.location.lng,
    },
    openingHours: dealer.workingHours,
  };
}

export function carJsonLd(input: {
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  year: number;
  images?: string[];
}) {
  const price = typeof input.price === 'number' ? input.price : Number(input.price);
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: input.name,
    brand: { '@type': 'Brand', name: brand.name },
    model: input.name,
    vehicleModelDate: String(input.year),
    description: input.description ?? undefined,
    url: absoluteUrl(`/catalog/${input.slug}`),
    image: input.images?.slice(0, 5),
    offers: Number.isFinite(price)
      ? {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: Math.round(price),
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(`/catalog/${input.slug}`),
        }
      : undefined,
  };
}

export function articleJsonLd(input: {
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.excerpt ?? undefined,
    datePublished: input.publishedAt ?? undefined,
    author: { '@type': 'Organization', name: dealer.name },
    publisher: { '@type': 'Organization', name: dealer.name },
    mainEntityOfPage: absoluteUrl(`/blog/${input.slug}`),
  };
}
