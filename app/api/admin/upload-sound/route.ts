import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createConnection } from '@/utils/db';
import { verifyJWT } from '@/utils/serverAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const payload = verifyJWT(token || '');

  if (!payload || !payload.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log('Received data:', { ...data, filePath: 'REDACTED' });
    
    const { title, description, soundpack_id, tags, filePath }: {
      title: string;
      description: string;
      soundpack_id?: string;
      tags: string[];
      filePath: string;
    } = data;

    // Validation
    if (!title || !description || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    console.log('Attempting to upload to Cloudinary...');
    const uploadResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Cloudinary handles audio files as "video"
      folder: 'soundbank',
      allowed_formats: ['mp3', 'wav', 'ogg'], // Restrict to audio formats
    }).catch(error => {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    });
    
    console.log('Cloudinary upload successful:', { 
      public_id: uploadResponse.public_id,
      url: uploadResponse.secure_url,
      duration: uploadResponse.duration 
    });

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
        `INSERT INTO sounds (title, description, file_url, duration, soundpack_id, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          title,
          description,
          uploadResponse.secure_url,
          uploadResponse.duration,
          soundpack_id || null, // Use null if soundpack_id is not provided
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
        url: uploadResponse.secure_url,
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
