import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/utils/db';
import { verifyJWT } from '@/utils/serverAuth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const payload = verifyJWT(token || '');

  if (!payload || !payload.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log('Received data:', { ...data, filePath: 'REDACTED' });
    
    const { 
      title, 
      description, 
      soundpack_id, 
      tags, 
      filePath, 
      duration,
      fileSize,
      fileFormat 
    }: {
      title: string;
      description: string;
      soundpack_id?: string;
      tags: string[];
      filePath: string;
      duration: number;
      fileSize: number;
      fileFormat: string;
    } = data;

    // Validation
    if (!title || !description || !filePath) {
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
      if (soundpack_id) {
        const [soundpacks] = await connection.execute(
          'SELECT id FROM soundpacks WHERE id = ?',
          [soundpack_id]
        );
        
        if (!(soundpacks as any[]).length) {
          throw new Error(`Soundpack with ID ${soundpack_id} does not exist`);
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
          title,
          description,
          filePath,
          duration,
          soundpack_id || null,
          fileSize,
          fileFormat,
        ]
      );

      const sound_id = (result as any).insertId;

      // Process and insert tags
      if (tags && tags.length > 0) {
        const normalizedTags: string[] = tags.map((tag: string) => {
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
        url: filePath,
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error: any) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to upload sound', details: error.message },
      { status: 500 }
    );
  }
}
