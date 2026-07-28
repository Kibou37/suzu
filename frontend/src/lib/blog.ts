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

const DEMO_POSTS: BlogPostDetail[] = [
  {
    id: 'demo-welcome',
    slug: 'welcome',
    title: 'Welcome to the Suzuki dealer site',
    excerpt: 'Browse models, configure your car and book a test drive.',
    coverImage: null,
    publishedAt: '2026-01-15T10:00:00.000Z',
    content:
      'This is demo content for static preview builds.\n\nExplore the catalog, try the configurator, or book a test drive when you are ready.',
  },
];

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (isDemoDataMode()) {
    return DEMO_POSTS.map(
      ({ id, slug, title, excerpt, coverImage, publishedAt }) => ({
        id,
        slug,
        title,
        excerpt,
        coverImage,
        publishedAt,
      }),
    );
  }

  try {
    const res = await fetch(apiUrl('/api/blog'), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  if (isDemoDataMode()) {
    return DEMO_POSTS.find((post) => post.slug === slug) ?? null;
  }

  try {
    const res = await fetch(apiUrl(`/api/blog/${slug}`), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
