import Link from 'next/link';
import { db } from '@/lib/db';
import { Download } from 'lucide-react';
import ArticleContentBlocks from '@/components/ArticleContentBlocks';

interface ArticleWithTranslation {
  id: number;
  slug: string;
  author: string | null;
  pdf_url: string | null;
  publisher: string | null;
  publication_info: string | null;
  documentation_url: string | null;
  title: string;
  abstract: string | null;
  content_blocks: { type: 'video' | 'sound' | 'heading' | 'table' | 'text' | 'link' | 'subheading'; url?: string; label?: string; text?: string; headers?: string[]; rows?: string[][] }[] | string | null;
}

async function getArticleEs(slug: string): Promise<ArticleWithTranslation | null> {
  const query = `
    SELECT
      a.id,
      a.slug,
      a.author,
      COALESCE(t.pdf_url, a.pdf_url) AS pdf_url,
      a.publisher,
      a.publication_info,
      a.documentation_url,
      COALESCE(t.title, a.title) AS title,
      COALESCE(t.abstract, a.abstract) AS abstract,
      COALESCE(t.content_blocks, a.content_blocks) AS content_blocks
    FROM articles a
    LEFT JOIN article_translations t
      ON t.article_id = a.id AND t.locale = 'es'
    WHERE a.slug = ?
  `;

  const rows = await db.query<ArticleWithTranslation>(query, [slug]);
  return rows?.[0] || null;
}

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticlePageEs({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleEs(slug);

  if (!article) {
    return (
      <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
        <Link
          href="/articles"
          className="inline-flex items-center text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
        >
          <span className="inline-block align-middle">←</span>
          <span className="ml-2">Volver a Artículos</span>
        </Link>
        <h1 className="text-3xl font-bold mt-4 text-red-500">Artículo no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/articles"
          className="inline-flex text-sm items-center text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
        >
          <span className="inline-block align-middle">←</span>
          <span className="ml-2">Volver a la lista de Artículos</span>
        </Link>
        <Link
          href={`/articles/${slug}`}
          className="inline-flex text-sm items-center text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
        >
          English version →
        </Link>
      </div>
      <article className="mt-4">
        <h1 className="text-2xl font-bold mb-2 text-yellow-200">{article.title}</h1>
        {article.author && (
          <p className="text-md text-gray-300">
            Por {article.author}
          </p>
        )}
        {(article.publication_info || article.publisher) && (
          <div className="text-sm text-gray-400 mt-2 space-y-1">
            {article.publication_info && (
              <p>{article.publication_info}</p>
            )}
            {article.publisher && (
              <p>Publicado por {article.publisher}</p>
            )}
          </div>
        )}
        {article.abstract && (
          <div className="bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm p-6 rounded-lg mb-16 mt-8">
            <h2 className="text-lg font-semibold mb-4 text-fuchsia-200">Resumen</h2>
            <div className="space-y-4">
              {article.abstract.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                <p key={i} className="text-gray-300 font-body leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
        )}
        {article.content_blocks && (
          <ArticleContentBlocks blocks={typeof article.content_blocks === 'string' ? JSON.parse(article.content_blocks) : article.content_blocks} />
        )}
        {(article.pdf_url || article.documentation_url) && (
          <div className={`mt-8 flex flex-col md:flex-row ${article.documentation_url ? 'justify-between' : 'md:justify-end'} items-center gap-4`}>
            {article.documentation_url && (
              <p className="text-base text-gray-400 text-center">
                Enlace a la documentación:{' '}
                <a
                  href={article.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
                >
                  {article.documentation_url}
                </a>
              </p>
            )}
            {article.pdf_url && (
              <a
                href={article.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-3 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm transition-colors duration-200 hover:from-white/10 hover:to-white/15 text-yellow-200 rounded-lg hover:text-fuchsia-500"
              >
                <Download size={18} className="mr-2" />
                Artículo completo en PDF
              </a>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
