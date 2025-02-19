import { NextResponse } from 'next/server';
import { createConnection, closeConnection } from '@/utils/db';

interface Sound {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  file_format: string | null;
  duration: number | null;
  file_size: number | null;
  created_at: string;
  soundpack_name: string | null;
  soundpack_description: string | null;
  tags: string | null;
}

export async function GET() {
  let connection;
  try {
    connection = await createConnection();

    // Query to get sounds with their tags and soundpack information
    const [rows] = await connection.execute(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.file_url,
        s.file_format,
        s.duration,
        s.file_size,
        s.created_at,
        sp.name as soundpack_name,
        sp.description as soundpack_description,
        GROUP_CONCAT(h.tag) as tags
      FROM sounds s
      LEFT JOIN soundpacks sp ON s.soundpack_id = sp.id
      LEFT JOIN entity_hashtags eh ON s.id = eh.entity_id AND eh.entity_type = 'sound'
      LEFT JOIN hashtags h ON eh.hashtag_id = h.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    if (!Array.isArray(rows)) {
      throw new Error('Database query did not return an array');
    }

    // Transform the data to match our frontend expectations
    const transformedSounds = (rows as Sound[]).map(sound => ({
      id: sound.id?.toString() || '',
      title: sound.title || '',
      description: sound.description || null,
      fileUrl: sound.file_url || '',
      fileFormat: sound.file_format || null,
      duration: sound.duration || null,
      fileSize: sound.file_size || null,
      createdAt: sound.created_at?.toString() || '',
      soundpackName: sound.soundpack_name || null,
      soundpackDescription: sound.soundpack_description || null,
      tags: sound.tags ? sound.tags.split(',').filter(Boolean) : []
    }));

    return NextResponse.json(transformedSounds);
  } catch (error) {
    console.error('Error fetching sounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sounds' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await closeConnection(connection);
    }
  }
}
