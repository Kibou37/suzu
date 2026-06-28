import Image from 'next/image';
import Link from 'next/link';

const newsItems = [
  {
    date: '8 Jun 2026',
    title: 'Suzuki launches first flex-fuel vehicle in India',
    href: '/blog',
    image: 'https://img.perxis.ru/unsafe/620x0/prxs/originals/d8janu0beucc73cerja0/original',
  },
  {
    date: '22 May 2026',
    title: 'Production starts at Suzuki second plant in Haryana',
    href: '/blog',
    image: 'https://img.perxis.ru/unsafe/620x0/prxs/originals/d8janu0beucc73cerja0/original',
  },
  {
    date: '14 May 2026',
    title: 'Suzuki — main partner of Capcom Cup 13 tournament',
    href: '/blog',
    image: 'https://img.perxis.ru/unsafe/620x0/prxs/originals/d8janu0beucc73cerja0/original',
  },
] as const;

export function NewsSection() {
  return (
    <section className="news-section">
      <div className="page-title-center">
        <h2>News</h2>
      </div>

      <div className="container-suzuki">
        <ul className="news-grid">
          {newsItems.map((item) => (
            <li key={item.title}>
              <Link href={item.href} className="news-card">
                <div className="news-card__image">
                  <Image src={item.image} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="news-card__body">
                  <time className="news-card__date">{item.date}</time>
                  <p className="news-card__title">{item.title}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="news-section__footer">
          <Link href="/blog" className="btn btn-secondary">
            All News
          </Link>
        </div>
      </div>
    </section>
  );
}
