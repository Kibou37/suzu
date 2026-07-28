import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

/** Required for `output: 'export'` (GitHub Pages). */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/api/'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
