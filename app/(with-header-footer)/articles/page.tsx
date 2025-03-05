import Link from 'next/link';
import { db } from '@/lib/db';

interface Article {
  id: number;
  title: string;
  author: string | null;
  slug: string;
}

async function getArticles(): Promise<Article[]> {
  const query = `
    SELECT 
      id,
      title,
      author,
      slug
    FROM articles 
    ORDER BY id DESC
  `;
  
  return await db.query<Article>(query);
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 mt-6 text-yellow-200 font-heading">Articles</h1>
      {articles.length === 0 ? (
        <p className="text-gray-400">No articles found.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.id} className="relative pl-8 before:content-['→'] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:text-fuchsia-200 before:font-bold">
              <Link
                href={`/articles/${article.slug}`}
                className="block p-6 rounded-lg bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm transition-colors duration-200 hover:from-white/10 hover:to-white/15"
              >
                <h2 className="font-heading text-sm md:text-base text-gray-900 dark:text-white hover:text-fuchsia-200 transition-colors duration-200">
                  {article.title}
                </h2>
                {article.author && (
                  <p className="text-sm text-gray-400 mt-2">
                    By {article.author}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
