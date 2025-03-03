import Link from 'next/link';
import { db } from '@/lib/db';
import PdfViewer from '@/components/PdfViewer';

interface Article {
  id: number;
  title: string;
  abstract: string | null;
  author: string | null;
  pdf_url: string | null;
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    const query = `
      SELECT 
        id,
        title,
        abstract,
        author,
        pdf_url
      FROM articles
      WHERE id = ?
    `;

    const rows = await db.query<Article>(query, [id]);
    return rows?.[0] || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/articles" 
          className="inline-flex items-center mb-6 text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          Back to Articles
        </Link>
        <h1 className="text-3xl font-bold mb-8 text-red-500">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/articles" 
        className="inline-flex items-center mb-6 text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
      >
        <span className="mr-2">←</span>
        Back to Articles
      </Link>
      <article>
        <h1 className="text-3xl font-bold mb-8 text-yellow-200">{article.title}</h1>
        {article.author && (
          <p className="text-gray-400 mb-8">
            By {article.author}
          </p>
        )}
        {article.abstract && (
          <div className="bg-white/5 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold mb-4 text-fuchsia-200">Abstract</h2>
            <p className="text-gray-300 font-body space-y-4 leading-relaxed">{article.abstract}</p>
          </div>
        )}
        {article.pdf_url && (
          <PdfViewer pdfUrl={article.pdf_url} />
        )}
      </article>
    </div>
  );
}
