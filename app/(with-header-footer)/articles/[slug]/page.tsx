import Link from 'next/link';
import { db } from '@/lib/db';
import { Download } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  abstract: string | null;
  author: string | null;
  pdf_url: string | null;
  slug: string;
  publisher: string | null;
  publication_info: string | null;
}

async function getArticle(slug: string): Promise<Article | null> {
  const query = `
    SELECT 
      id,
      title,
      abstract,
      author,
      pdf_url,
      slug,
      publisher,
      publication_info
    FROM articles 
    WHERE slug = ?
  `;
  
  const rows = await db.query<Article>(query, [slug]);
  return rows?.[0] || null;
}

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
        <Link 
          href="/articles" 
          className="inline-flex items-center text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
        >
          <span className="inline-block align-middle">←</span>
          <span className="ml-2">Back to Articles</span>
        </Link>
        <h1 className="text-3xl font-bold mt-4 text-red-500">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
      <Link 
        href="/articles" 
        className="inline-flex text-md items-center text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
      >
        <span className="inline-block align-middle">←</span>
        <span className="ml-2">Back to Articles</span>
      </Link>
      <article className="mt-4">
        <h1 className="text-2xl font-bold mb-2 text-yellow-200">{article.title}</h1>
        {article.author && (
          <p className="text-md text-gray-300">
            By {article.author}
          </p>
        )}
        {(article.publication_info || article.publisher) && (
          <div className="text-sm text-gray-400 mb-8 mt-2 space-y-1">
            {article.publication_info && (
              <p>{article.publication_info}</p>
            )}
            {article.publisher && (
              <p>Published by {article.publisher}</p>
            )}
          </div>
        )}
        {article.abstract && (
          <div className="bg-white/5 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold mb-4 text-fuchsia-200">Abstract</h2>
            <p className="text-gray-300 font-body space-y-4 leading-relaxed">{article.abstract}</p>
          </div>
        )}
        {article.pdf_url && (
          <div className="mt-8 flex justify-center md:justify-end">
            <a 
              href={article.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-3 bg-white/5 text-yellow-200 hover:bg-white/10 rounded-lg hover:text-fuchsia-500 transition-colors duration-200"
            >
              <Download size={18} className="mr-2" />
              Full pdf article
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
