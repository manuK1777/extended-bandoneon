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

interface TagInfo {
  id: number;
  tag: string;
}

async function getSoundpackTags(soundpackId: string): Promise<TagInfo[]> {
  const soundpackTags = await db.query<RowDataPacket>(
    `SELECT T2.id, T2.tag 
     FROM soundpacks T1 
     INNER JOIN entity_hashtags T3 ON T1.id = T3.entity_id 
     INNER JOIN hashtags T2 ON T3.hashtag_id = T2.id 
     WHERE T1.id = ? AND T3.entity_type = 'soundpack'`,
    [soundpackId]
  );

  return soundpackTags.map((row) => ({
    id: row.id,
    tag: row.tag
  }));
}

function processTags(tags: string[]) {
  return tags.map((tag) => sanitizeTag(tag)).filter(Boolean);
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
      let soundpackTagInfos: TagInfo[] = [];
      if (data.soundpack_id) {
        soundpackTagInfos = await getSoundpackTags(data.soundpack_id);
        console.log('Soundpack tags:', soundpackTagInfos);
      }

      // Process new tags from the sound
      const newTags = data.tags ? processTags(data.tags) : [];
      
      // Keep track of processed tags and their IDs
      const processedTagIds = new Map<string, number>();
      
      // First, add all soundpack tags to the map
      for (const tagInfo of soundpackTagInfos) {
        processedTagIds.set(tagInfo.tag, tagInfo.id);
      }

      // Process only new tags that aren't from the soundpack
      for (const tag of newTags) {
        if (!processedTagIds.has(tag)) {
          try {
            // Insert new tag
            const result = await db.execute(
              `INSERT INTO hashtags (tag) 
               VALUES (?) 
               ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
              [tag]
            );
            
            const hashtagId = result.insertId;
            processedTagIds.set(tag, hashtagId);
            console.log('New tag processed:', { tag, hashtagId });
          } catch (error) {
            console.error('Error processing tag:', tag, error);
            tagErrors.push(`Failed to process tag: ${tag}`);
          }
        }
      }

      // Link all tags to the sound
      for (const [tag, hashtagId] of processedTagIds) {
        try {
          await db.execute(
            'INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id) VALUES (?, ?, ?)',
            [soundId, 'sound', hashtagId]
          );
          console.log('Linked tag to sound:', { tag, hashtagId });
        } catch (error) {
          console.error('Error linking tag:', tag, error);
          tagErrors.push(`Failed to link tag: ${tag}`);
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
