import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/utils/db';
import { verifyJWT } from '@/utils/serverAuth';

interface SoundpackRow {
  id: number;
}

interface DbResult {
  insertId: number;
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
    if (!data.title || !data.description || !data.filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    const connection = await createConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Validate soundpack_id if provided
      if (data.soundpack_id) {
        const [soundpacks] = await connection.execute(
          'SELECT id FROM soundpacks WHERE id = ?',
          [data.soundpack_id]
        );
        
        if (!(soundpacks as SoundpackRow[]).length) {
          throw new Error(`Soundpack with ID ${data.soundpack_id} does not exist`);
        }
      }

      // Insert sound
      const [result] = await connection.execute(
        `INSERT INTO sounds (
          title, 
          description, 
          file_url, 
          duration, 
          soundpack_id, 
          file_size,
          file_format,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.title,
          data.description,
          data.filePath,
          data.duration,
          data.soundpack_id || null,
          data.fileSize,
          data.fileFormat,
        ]
      );

      const sound_id = (result as DbResult).insertId;

      // Process and insert tags
      if (data.tags && data.tags.length > 0) {
        const normalizedTags: string[] = data.tags.map((tag: string) => {
          let normalizedTag = tag.toLowerCase().trim();
          normalizedTag = normalizedTag.replace(/\s+/g, ' ');
          normalizedTag = normalizedTag.replace(/[^a-z0-9\s-]/g, '');
          return normalizedTag;
        }).filter(tag => tag.length > 0);

        for (const tag of normalizedTags) {
          await connection.execute(
            `INSERT IGNORE INTO hashtags (tag, created_at) VALUES (?, NOW())`,
            [tag]
          );

          // Then link it to the sound
          await connection.execute(
            `INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id) 
             SELECT ?, 'sound', id FROM hashtags WHERE tag = ?`,
            [sound_id, tag]
          );
        }
      }

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        message: 'Sound uploaded successfully!',
        sound_id,
        url: data.filePath,
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error: unknown) {
    console.error('Upload error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json(
      { error: 'Failed to upload sound', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
