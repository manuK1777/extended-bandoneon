import Link from 'next/link';
import { createConnection, closeConnection } from '@/lib/db/connection';
import { RowDataPacket } from 'mysql2';

interface Technique extends RowDataPacket {
  id: number;
  slug: string;
  title: string;
  description: string;
}

async function getTechniques(): Promise<Technique[]> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<Technique[]>(
      'SELECT id, slug, title, description FROM techniques ORDER BY created_at DESC'
    );
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    return [];
  } finally {
    await closeConnection(connection);
  }
}

export default async function TechniquesPage() {
  const techniques = await getTechniques();

  return (
    <main className="container w-[90%] lg:w-[70%] mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading">Extended Techniques</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniques.map((technique) => (
          <Link
            key={technique.id}
            href={`/techniques/${technique.slug}`}
            className="block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
          >
            <h2 className="text-2xl font-semibold mb-2 text-fuchsia-200">{technique.title}</h2>
            <p className="text-gray-400 text-md">
              {technique.description.split('\n\n')[0].replace(/^#\s/, '').slice(0, 150)}...
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
