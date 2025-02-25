import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

console.log('Cloudinary Config:', {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.slice(-4), 
  has_secret: !!process.env.CLOUDINARY_API_SECRET,
});

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
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
    `;

    const result = await db.query(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch audio files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
