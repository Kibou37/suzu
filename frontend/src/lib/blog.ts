import { DEMO_BLOG_POSTS } from '@/data/demo-content';
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

function toSummary(post: BlogPostDetail): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
  };
}

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (isDemoDataMode()) {
    return DEMO_BLOG_POSTS.map(toSummary);
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
    return DEMO_BLOG_POSTS.find((post) => post.slug === slug) ?? null;
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
