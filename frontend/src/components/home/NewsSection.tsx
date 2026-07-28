import Link from 'next/link';
import { NewsGrid } from '@/components/home/NewsGrid';
import type { BlogPostSummary } from '@/lib/blog';

type NewsSectionProps = {
  posts: BlogPostSummary[];
};

export function NewsSection({ posts }: NewsSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="news-section">
      <div className="page-title-center">
        <h2>News</h2>
      </div>

      <div className="container-suzuki">
        <NewsGrid posts={posts} />

        <div className="news-section__footer">
          <Link href="/blog" className="btn btn-secondary">
            All News
          </Link>
        </div>
      </div>
    </section>
  );
}
