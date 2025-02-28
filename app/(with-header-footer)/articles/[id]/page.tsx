import Link from 'next/link';

export default function ArticlePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const articles = [
    {
      id: 'organografia-bandoneon',
      title: 'Organografía del bandoneón y prácticas musicales: Lógica dispositiva de los teclados del bandoneón rheinische Tonlage 38/33 y la escritura ideográfica'
    }
  ];

  const article = articles.find(article => article.id === id);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Article not found</h1>
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
      <h1 className="text-3xl font-bold mb-8">{article.title}</h1>
      <div className="prose dark:prose-invert">
        <p>Article content will go here...</p>
      </div>
    </div>
  );
}
