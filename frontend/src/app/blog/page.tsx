import { NewsGrid } from '@/components/home/NewsGrid';
import { getBlogPosts } from '@/lib/blog';

export const metadata = { title: 'News' };

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="news-section news-section--page">
      <div className="page-title-center">
        <h1>News</h1>
      </div>

      <div className="container-suzuki">
        {posts.length === 0 ? (
          <div className="placeholder-box">No articles published yet — please check back soon.</div>
        ) : (
          <NewsGrid posts={posts} />
        )}
      </div>
    </section>
  );
}
