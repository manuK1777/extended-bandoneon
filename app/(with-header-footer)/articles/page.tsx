import Link from 'next/link';
import { headers } from 'next/headers';

interface Article {
  id: number;
  title: string;
  abstract: string | null;
  author: string | null;
  pdf_url: string | null;
}

async function getArticles(): Promise<Article[]> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  const response = await fetch(`${protocol}://${host}/api/articles`, {
    next: {
      revalidate: 3600 // Cache for 1 hour
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading">Articles</h1>
      {articles.length === 0 ? (
        <p className="text-gray-400">No articles found.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.id} className="relative pl-8 before:content-['→'] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:text-fuchsia-200 before:font-bold">
              <Link
                href={`/articles/${article.id}`}
                className="block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-20"
              >
                <h2 className="font-heading text-sm md:text-base text-gray-900 dark:text-white hover:text-fuchsia-200 transition-colors duration-20">
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
