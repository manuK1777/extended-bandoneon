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
    const { title, description, soundpack_id, tags, filePath } = data;

    // Validation
    if (!title || !description || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Cloudinary handles audio files as "video"
      folder: 'soundbank',
    });

    // Connect to database
    const connection = await createConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Insert sound
      const [result] = await connection.execute(
        `INSERT INTO sounds (title, description, file_url, duration, soundpack_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          title,
          description,
          uploadResponse.secure_url,
          uploadResponse.duration,
          soundpack_id,
        ]
      );

      const sound_id = (result as any).insertId;

      // Insert tags
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          // First ensure the tag exists
          await connection.execute(
            `INSERT IGNORE INTO hashtags (tag, created_at) VALUES (?, NOW())`,
            [tag.toLowerCase()]
          );

          // Then link it to the sound
          await connection.execute(
            `INSERT INTO entity_hashtags (entity_id, entity_type, hashtag_id, created_at) 
             SELECT ?, 'sound', id, NOW() FROM hashtags WHERE tag = ?`,
            [sound_id, tag.toLowerCase()]
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
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload sound', details: error.message },
      { status: 500 }
    );
  }
}
