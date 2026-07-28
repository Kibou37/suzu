import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageShell';
import { getBlogPost } from '@/lib/blog';
import { articleJsonLd, safeJsonLdStringify } from '@/lib/json-ld';
import { absoluteUrl } from '@/lib/seo';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'News' };

  const url = absoluteUrl(`/blog/${post.slug}`);
  const description = post.excerpt ?? post.title;

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: 'article',
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = articleJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
  });

  return (
    <div className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <div className="container-suzuki">
        <PageHeader
          title={post.title}
          description={formatDate(post.publishedAt)}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'News', href: '/blog' },
            { label: post.title },
          ]}
        />

        <article className="mx-auto max-w-3xl pb-16">
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- admin-managed, arbitrary external URLs
            <img
              src={post.coverImage}
              alt={post.title}
              className="mb-6 h-72 w-full rounded-xl object-cover"
            />
          )}
          <div className="whitespace-pre-line text-base leading-relaxed text-suzuki-navy">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
}
