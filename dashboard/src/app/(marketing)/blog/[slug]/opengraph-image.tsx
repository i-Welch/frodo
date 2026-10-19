import { ogCard, OG_SIZE } from '../../../og-card';
import { articles, type ArticleCategory } from '../articles-index';

// Per-article link preview: category, title and date, so each LinkedIn share
// shows its own headline instead of the site-wide card.

export const alt = 'RAVEN Research article';
export const size = OG_SIZE;
export const contentType = 'image/png';

const CATEGORY_LABEL: Record<ArticleCategory, string> = {
  bank: 'Bank deep dive',
  creditunion: 'Credit union deep dive',
  denovo: 'De Novo Watch',
  fintech: 'Fintech analysis',
  guide: 'RAVEN Guide',
  platform: 'RAVEN Research',
};

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return ogCard({ eyebrow: 'RAVEN Research', title: 'Research for community banks and credit unions' });
  return ogCard({
    eyebrow: `${CATEGORY_LABEL[article.category]}  ·  ${article.date}`,
    title: article.title,
    subtitle: `${article.readTime}, built from public FDIC, NCUA, HMDA and SEC data`,
  });
}
