import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT } from '@/utils/serverAuth';
import { RowDataPacket } from 'mysql2';
import { sanitizeTag } from '@/utils/tag-utils';

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

async function getSoundpackTags(soundpackId: string) {
  const soundpackTags = await db.query<RowDataPacket>(
    `SELECT T2.tag 
     FROM soundpacks T1 
     INNER JOIN entity_hashtags T3 ON T1.id = T3.entity_id 
     INNER JOIN hashtags T2 ON T3.hashtag_id = T2.id 
     WHERE T1.id = ? AND T3.entity_type = 'soundpack'`,
    [soundpackId]
  );

  return soundpackTags.map((tag) => tag.tag);
}

function processTags(tags: string[]) {
  return tags.map((tag) => sanitizeTag(tag, true)).filter(Boolean);
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
      let tagErrors: string[] = [];

      // If soundpack_id is provided, get its tags
      let soundpackTags: string[] = [];
      if (data.soundpack_id) {
        soundpackTags = await getSoundpackTags(data.soundpack_id);
        console.log('Soundpack tags:', soundpackTags);
      }

      // Combine soundpack tags with sound's own tags
      const allTags = [...new Set([
        ...(data.tags ? processTags(data.tags) : []),
        ...soundpackTags
      ])];

      console.log('All tags to process:', allTags);

      // Process tags
      for (const tag of allTags) {
        try {
          // Insert or get hashtag
          const result = await db.execute(
            'INSERT INTO hashtags (tag) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [tag]
          );

          const hashtagId = result.insertId;

          // Link hashtag to sound
          await db.execute(
            'INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id) VALUES (?, ?, ?)',
            [soundId, 'sound', hashtagId]
          );
        } catch (error) {
          console.error('Error processing tag:', tag, error);
          tagErrors.push(`Failed to process tag: ${tag}`);
        }
      }

      return NextResponse.json({
        message: 'Sound uploaded successfully!',
        sound_id: soundId,
        url: data.filePath,
        tagErrors: tagErrors.length > 0 ? tagErrors : undefined
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
