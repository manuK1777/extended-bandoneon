import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

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
    const result = await cloudinary.search
      .expression('resource_type:audio')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const mp3Files = result.resources.filter((file: { format: string }) => file.format === 'mp3');
    return NextResponse.json(mp3Files);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch audio files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
