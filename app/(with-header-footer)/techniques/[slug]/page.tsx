import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TechniqueLayout } from '../components/TechniqueLayout';
import { createConnection, closeConnection } from '@/lib/db/connection';
import { RowDataPacket } from 'mysql2';

interface Technique extends RowDataPacket {
  id: number;
  slug: string;
  title: string;
  description: string;
  layout: string;
}

interface Media extends RowDataPacket {
  id: number;
  technique_id: number;
  type: 'image' | 'video';
  url: string;
}

async function getTechnique(slug: string): Promise<Technique | null> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<Technique[]>(
      'SELECT * FROM techniques WHERE slug = ? LIMIT 1',
      [slug]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch technique');
  } finally {
    await closeConnection(connection);
  }
}

async function getTechniqueMedia(techniqueId: number): Promise<Media[]> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<Media[]>(
      'SELECT * FROM technique_media WHERE technique_id = ?',
      [techniqueId]
    );
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch technique media');
  } finally {
    await closeConnection(connection);
  }
}

export default async function TechniquePage({
  params,
}: {
  params: { slug: string };
}) {
  const technique = await getTechnique(params.slug);
  
  if (!technique) {
    notFound();
  }

  const media = await getTechniqueMedia(technique.id);

  return (
    <main className="container w-[90%] mx-auto px-4 py-8">
      <Link 
          href="/techniques" 
          className="mb-8 inline-flex items-center text-fuchsia-200 hover:text-fuchsia-300 transition-colors duration-200"
        >
          <span className="inline-block align-middle mb-1">←</span>
          <span className="ml-2">Back to techniques</span>
        </Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-200 font-heading">
        {technique.title}
      </h1>
      <TechniqueLayout technique={technique} media={media} />
    </main>
  );
}
