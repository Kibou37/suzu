import Link from 'next/link';
import type { BlogPostSummary } from '@/lib/blog';

type NewsGridProps = {
  posts: BlogPostSummary[];
};

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function NewsGrid({ posts }: NewsGridProps) {
  return (
    <ul className="news-grid">
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`} className="news-card">
            <div className="news-card__image">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-managed, arbitrary external URLs
                <img src={post.coverImage} alt="" />
              ) : null}
            </div>
            <div className="news-card__body">
              {post.publishedAt ? (
                <time className="news-card__date" dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              ) : null}
              <p className="news-card__title">{post.title}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
