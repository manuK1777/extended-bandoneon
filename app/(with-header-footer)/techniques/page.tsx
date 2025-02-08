import Link from 'next/link';

const techniques = [
  { id: 'technique-1', name: 'Technique 1' },
  { id: 'technique-2', name: 'Technique 2' },
  { id: 'technique-3', name: 'Technique 3' },
  { id: 'technique-4', name: 'Technique 4' },
  { id: 'technique-5', name: 'Technique 5' },
];

export default function TechniquesPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Extended Techniques</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniques.map((technique) => (
          <Link
            key={technique.id}
            href={`/techniques/${technique.id}`}
            className="block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
          >
            <h2 className="text-2xl font-semibold mb-2">{technique.name}</h2>
            <p className="text-gray-400">Click to learn more about this technique</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
