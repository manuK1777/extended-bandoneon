import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Sound {
  id: number;
  title: string;
  description: string | null;
  mp3_url: string;
  duration: number | null;
  file_size: number | null;
  file_format: string | null;
  created_at: string;
  soundpack_name: string | null;
  soundpack_description: string | null;
  tags: string | null;
}

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    console.log('Executing database query...');
    
    // Base query with cursor-based pagination
    let query = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.mp3_url,
        s.duration,
        s.file_size,
        s.file_format,
        s.created_at,
        sp.name as soundpack_name,
        sp.description as soundpack_description,
        GROUP_CONCAT(h.tag) as tags
      FROM sounds s
      LEFT JOIN soundpacks sp ON s.soundpack_id = sp.id
      LEFT JOIN entity_hashtags eh ON s.id = eh.entity_id AND eh.entity_type = 'sound'
      LEFT JOIN hashtags h ON eh.hashtag_id = h.id
      WHERE s.mp3_url LIKE '%/extended-bandoneon/soundbank/mp3/%'
    `;

    const queryParams: (string | number)[] = [];
    
    if (cursor) {
      query += ' AND s.id < ?';
      queryParams.push(parseInt(cursor));
    }
    
    query += ' GROUP BY s.id ORDER BY s.id DESC LIMIT ?';
    queryParams.push(limit);

    const rows = await db.query<Sound>(query, queryParams);
    
    console.log(`Query successful, retrieved ${rows.length} sounds`);

    // Handle case where no rows are returned
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        sounds: [],
        nextCursor: null,
        hasMore: false
      });
    }

    // Get the next cursor
    const lastItem = rows[rows.length - 1];
    const nextCursor = rows.length === limit && lastItem.id > 1 ? lastItem.id.toString() : null;

    // Transform the data to match our frontend expectations
    const transformedSounds = rows.map(sound => ({
      id: sound.id?.toString() || '',
      title: sound.title || '',
      description: sound.description || null,
      fileUrl: sound.mp3_url || '',
      fileFormat: sound.file_format || null,
      duration: sound.duration || null,
      fileSize: sound.file_size || null,
      createdAt: sound.created_at || '',
      soundpackName: sound.soundpack_name || null,
      soundpackDescription: sound.soundpack_description || null,
      tags: sound.tags ? sound.tags.split(',').filter(Boolean) : []
    }));

    return NextResponse.json({
      sounds: transformedSounds,
      nextCursor,
      hasMore: nextCursor !== null
    });

  } catch (error) {
    console.error('Error in /api/sounds:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      env: process.env.NODE_ENV
    });

    return NextResponse.json(
      { error: 'Failed to fetch sounds' },
      { status: 500 }
    );
  }
}
