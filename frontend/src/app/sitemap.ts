import type { MetadataRoute } from 'next';
import { getCars } from '@/lib/api';
import { getBlogPosts } from '@/lib/blog';
import { absoluteUrl } from '@/lib/seo';

const STATIC_PATHS = [
  '/',
  '/catalog',
  '/catalog/used',
  '/catalog/offers',
  '/configurator',
  '/test-drive',
  '/service',
  '/finance',
  '/dealers',
  '/contacts',
  '/about',
  '/faq',
  '/blog',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  let carEntries: MetadataRoute.Sitemap = [];
  try {
    const cars = await getCars();
    carEntries = cars.map((car) => ({
      url: absoluteUrl(`/catalog/${car.slug}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    carEntries = [];
  }

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts();
    blogEntries = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...carEntries, ...blogEntries];
}
