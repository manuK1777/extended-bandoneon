import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface SoundpackRow extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  tags: string | null;
}

interface HashtagRow extends RowDataPacket {
  id: number;
  tag: string;
  created_at: Date;
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
    const [rows] = await db.query<SoundpackRow[]>(
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
        GROUP BY s.id
        ORDER BY s.name ASC
      `
    );

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

    // Process tags if provided
    const tagArray = data.tags
      ? data.tags
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag !== ',')
      : [];

    console.log('Processing tags:', {
      originalTags: data.tags,
      processedTags: tagArray,
    });

    if (tagArray.length > 0) {
      for (const tag of tagArray) {
        try {
          console.log('Processing tag:', tag);

          // Insert or get hashtag
          const insertResult = await db.execute(
            'INSERT INTO hashtags (tag) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [tag]
          );
          console.log('Hashtag insert result:', insertResult);

          // Get the hashtag ID (either newly inserted or existing)
          const hashtagRows = await db.query<HashtagRow>(
            'SELECT id FROM hashtags WHERE tag = ?',
            [tag]
          );
          console.log('Hashtag query result:', hashtagRows);

          if (hashtagRows.length === 0) {
            throw new Error(`Failed to get hashtag ID for tag: ${tag}`);
          }

          const hashtagId = hashtagRows[0].id;
          console.log('Using hashtag ID:', hashtagId);

          // Link hashtag to soundpack
          await db.execute(
            'INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id) VALUES (?, ?, ?)',
            [soundpackId, 'soundpack', hashtagId]
          );
          console.log('Successfully linked hashtag to soundpack');
        } catch (error) {
          console.error('Error processing tag:', tag, error);
          throw error;
        }
      }
    }

    // Fetch the created soundpack with its tags
    const soundpacks = await db.query<SoundpackRow>(
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

    if (soundpacks.length === 0) {
      throw new Error('Failed to fetch created soundpack');
    }

    const transformedSoundpack: Soundpack = {
      ...soundpacks[0],
      tags: soundpacks[0].tags ? soundpacks[0].tags.split(',').filter(Boolean) : [],
    };

    return NextResponse.json(transformedSoundpack, { status: 201 });
  } catch (error) {
    console.error('Error creating soundpack:', error);
    return NextResponse.json(
      { error: 'Failed to create soundpack' },
      { status: 500 }
    );
  }
}
