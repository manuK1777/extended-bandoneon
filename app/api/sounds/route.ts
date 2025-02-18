import { NextResponse } from 'next/server';
import getConnection from '@/utils/mysql';

export async function GET() {
  try {
    const connection = await getConnection();

    // Query to get sounds with their tags and soundpack information
    const [sounds] = await connection.execute(`
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

    // Transform the data to match our frontend expectations
    const transformedSounds = (sounds as any[]).map(sound => ({
      id: sound.id.toString(),
      title: sound.title,
      description: sound.description,
      fileUrl: sound.file_url,
      fileFormat: sound.file_format,
      duration: sound.duration,
      fileSize: sound.file_size,
      createdAt: sound.created_at,
      soundpackName: sound.soundpack_name,
      soundpackDescription: sound.soundpack_description,
      tags: sound.tags ? sound.tags.split(',') : []
    }));

    await connection.end();
    return NextResponse.json(transformedSounds);
  } catch (error) {
    console.error('Error fetching sounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sounds' },
      { status: 500 }
    );
  }
}
