import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processTags } from '@/utils/tag-utils';

interface SoundpackRow {
  id: number;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  tags: string | null;
}

interface NewSoundpack {
  name: string;
  description: string;
  cover_image_url: string;
  tags: string;
}

interface Soundpack {
  id: number;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  tags: string[];
}

export async function GET() {
  try {
    const rows = await db.query<SoundpackRow & { tags: string }>(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.cover_image_url,
        GROUP_CONCAT(h.tag) as tags
      FROM soundpacks s
      LEFT JOIN entity_hashtags eh ON s.id = eh.entity_id AND eh.entity_type = 'soundpack'
      LEFT JOIN hashtags h ON eh.hashtag_id = h.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);

    const transformedSoundpacks: Soundpack[] = (Array.isArray(rows) ? rows : []).map(
      (pack) => ({
        id: pack.id,
        name: pack.name,
        description: pack.description,
        cover_image_url: pack.cover_image_url,
        tags: pack.tags ? pack.tags.split(',').filter(Boolean) : [],
      })
    );

    return NextResponse.json(transformedSoundpacks);
  } catch (error) {
    console.error('Error fetching soundpacks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soundpacks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: NewSoundpack = await request.json();
    console.log('Received request body:', data);

    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      console.error('Invalid name:', data.name);
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if soundpack with same name already exists
    const rows = await db.query<SoundpackRow>(
      'SELECT id FROM soundpacks WHERE name = ?',
      [data.name.trim()]
    );

    if (rows.length > 0) {
      return NextResponse.json(
        { error: 'A soundpack with this name already exists' },
        { status: 400 }
      );
    }

    // Insert soundpack
    const result = await db.execute(
      'INSERT INTO soundpacks (name, description, cover_image_url) VALUES (?, ?, ?)',
      [
        data.name.trim(),
        data.description?.trim() || null,
        data.cover_image_url?.trim() || null,
      ]
    );

    const soundpackId = result.insertId;
    const tagErrors: string[] = [];
    const processedTags: string[] = [];

    // Process tags using the utility function
    const tagArray = processTags(data.tags);

    console.log('Starting tag processing:', {
      originalTags: data.tags,
      processedTags: tagArray,
    });

    if (tagArray.length > 0) {
      for (const tag of tagArray) {
        try {
          console.log('Processing tag:', tag);

          // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
          const result = await db.execute(
            `INSERT INTO hashtags (tag) 
             VALUES (?) 
             ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
            [tag]
          );
          
          const hashtagId = result.insertId;
          console.log('Tag processed:', { tag, hashtagId });

          // Link hashtag to soundpack
          await db.execute(
            'INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id) VALUES (?, ?, ?)',
            [soundpackId, 'soundpack', hashtagId]
          );
          
          // Track successfully processed tag
          processedTags.push(tag);
          console.log('Successfully linked hashtag to soundpack:', { tag, hashtagId });
        } catch (error) {
          console.error('Error processing tag:', { tag, error });
          tagErrors.push(`Failed to process tag: ${tag}`);
        }
      }
    }

    console.log('Tag processing summary:', {
      total: tagArray.length,
      processed: processedTags.length,
      errors: tagErrors.length,
      processedTags,
      tagErrors
    });

    // Fetch the created soundpack with its tags
    const soundpacks = await db.query<SoundpackRow & { tags: string }>(
      `
        SELECT 
          s.id,
          s.name,
          s.description,
          s.cover_image_url,
          GROUP_CONCAT(h.tag) as tags
        FROM soundpacks s
        LEFT JOIN entity_hashtags eh ON s.id = eh.entity_id AND eh.entity_type = 'soundpack'
        LEFT JOIN hashtags h ON eh.hashtag_id = h.id
        WHERE s.id = ?
        GROUP BY s.id
      `,
      [soundpackId]
    );

    // Always return the soundpack data in a consistent format
    const soundpack = soundpacks[0] || {
      id: soundpackId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      cover_image_url: data.cover_image_url?.trim() || null,
      tags: ''
    };

    const transformedSoundpack: Soundpack = {
      ...soundpack,
      tags: soundpack.tags ? soundpack.tags.split(',').filter(Boolean) : []
    };

    console.log('Final response:', {
      soundpack: transformedSoundpack,
      tagErrors: tagErrors.length > 0 ? tagErrors : undefined
    });

    // Return success response with soundpack data and any tag errors
    return NextResponse.json({
      soundpack: transformedSoundpack,
      tagErrors: tagErrors.length > 0 && processedTags.length !== tagArray.length ? tagErrors : undefined
    }, { 
      status: 201 // Always return 201 if soundpack was created
    });
  } catch (error) {
    console.error('Error creating soundpack:', error);
    return NextResponse.json(
      { error: 'Failed to create soundpack' },
      { status: 500 }
    );
  }
}
