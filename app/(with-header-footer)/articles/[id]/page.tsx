export default function ArticlePage({ params }: { params: { id: string } }) {
  // TODO: Fetch article content based on params.id
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Article Title</h1>
      <div className="prose dark:prose-invert">
        <p>Article content will go here...</p>
      </div>
    </div>
  );
}
