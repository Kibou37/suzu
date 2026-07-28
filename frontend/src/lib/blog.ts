import { apiUrl, isDemoDataMode } from '@/lib/config';

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
};

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (isDemoDataMode()) return [];

  try {
    const res = await fetch(apiUrl('/api/blog'), { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  if (isDemoDataMode()) return null;

  try {
    const res = await fetch(apiUrl(`/api/blog/${slug}`), { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
