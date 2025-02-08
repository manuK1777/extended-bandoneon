import Link from 'next/link';

const techniques = [
  { id: 'technique-1', name: 'Technique 1' },
  { id: 'technique-2', name: 'Technique 2' },
  { id: 'technique-3', name: 'Technique 3' },
  { id: 'technique-4', name: 'Technique 4' },
  { id: 'technique-5', name: 'Technique 5' },
  { id: 'technique-6', name: 'Technique 6' },
  { id: 'technique-7', name: 'Technique 7' },
  { id: 'technique-8', name: 'Technique 8' },
  { id: 'technique-9', name: 'Technique 9' },
  { id: 'technique-10', name: 'Technique 10' },
  { id: 'technique-11', name: 'Technique 11' },
  { id: 'technique-12', name: 'Technique 12' },
  { id: 'technique-13', name: 'Technique 13' },
  { id: 'technique-14', name: 'Technique 14' },
  { id: 'technique-15', name: 'Technique 15' },
  { id: 'technique-16', name: 'Technique 16' },
  { id: 'technique-17', name: 'Technique 17' },
  { id: 'technique-18', name: 'Technique 18' },
  { id: 'technique-19', name: 'Technique 19' },
  { id: 'technique-20', name: 'Technique 20' },
  { id: 'technique-21', name: 'Technique 21' },
  { id: 'technique-22', name: 'Technique 22' },
  { id: 'technique-23', name: 'Technique 23' },
  { id: 'technique-24', name: 'Technique 24' },
  { id: 'technique-25', name: 'Technique 25' },
  { id: 'technique-26', name: 'Technique 26' },
  { id: 'technique-27', name: 'Technique 27' },
  { id: 'technique-28', name: 'Technique 28' },
  { id: 'technique-29', name: 'Technique 29' },
  { id: 'technique-30', name: 'Technique 30' },
  
  // Add more techniques as needed
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
