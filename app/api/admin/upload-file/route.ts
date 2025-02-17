import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication check here
    // if (!isAuthenticated(req)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if the request is multipart/form-data
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided or invalid file' },
        { status: 400 }
      );
    }

    // Convert the file to base64
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'video', // Cloudinary handles audio files as "video"
      folder: 'soundbank',
      allowed_formats: ['mp3', 'wav', 'ogg', 'm4a', 'aac'], // Add or remove formats as needed
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      duration: uploadResponse.duration,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Set the maximum file size for the route (default is 4MB, adjust as needed)
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    sizeLimit: '10mb', // Adjust this value based on your needs
  },
};
