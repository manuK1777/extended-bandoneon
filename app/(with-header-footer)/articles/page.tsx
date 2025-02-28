import Link from 'next/link';

export default function ArticlesPage() {
  const articles = [
    {
      id: 'organografia-bandoneon',
      title: 'Organografía del bandoneón y prácticas musicales: Lógica dispositiva de los teclados del bandoneón rheinische Tonlage 38/33 y la escritura ideográfica'
    }
  ];

  return (
    <div className="container w-[90%] lg:w-[70%] mx-auto space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading">Articles</h1>
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
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
