import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT } from '@/utils/serverAuth';
import { RowDataPacket } from 'mysql2';

interface SoundpackRow extends RowDataPacket {
  id: number;
}

interface SoundData {
  title: string;
  description: string;
  soundpack_id?: string;
  tags: string[];
  filePath: string;
  duration: number;
  fileSize: number;
  fileFormat: string;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const payload = verifyJWT(token || '');

  if (!payload || !payload.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data: SoundData = await req.json();
    console.log('Received data:', { ...data, filePath: 'REDACTED' });

    // Validation
    if (!data.title || !data.filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // Validate soundpack_id if provided
      if (data.soundpack_id) {
        const soundpacks = await db.query<SoundpackRow>(
          'SELECT id FROM soundpacks WHERE id = ?',
          [data.soundpack_id]
        );

        if (soundpacks.length === 0) {
          return NextResponse.json(
            { error: 'Invalid soundpack_id' },
            { status: 400 }
          );
        }
      }

      // Insert sound
      const result = await db.execute(
        `INSERT INTO sounds (title, description, file_url, duration, file_size, file_format, soundpack_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.title,
          data.description,
          data.filePath,
          data.duration,
          data.fileSize,
          data.fileFormat,
          data.soundpack_id || null,
        ]
      );

      const soundId = result.insertId;

      // Insert tags
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          // Format tag to match the database constraint: lowercase, replace spaces with hyphens
          const formattedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
          
          // Insert or get hashtag
          const hashtagResult = await db.execute(
            'INSERT INTO hashtags (tag) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [formattedTag]
          );

          const hashtagId = hashtagResult.insertId;

          // Link hashtag to sound
          await db.execute(
            'INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id) VALUES (?, ?, ?)',
            [soundId, 'sound', hashtagId]
          );
        }
      }

      return NextResponse.json({
        message: 'Sound uploaded successfully!',
        sound_id: soundId,
        url: data.filePath,
      });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save sound' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
