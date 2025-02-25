import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResourceType = 'video' | 'image' | 'auto' | 'raw';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: CloudinaryResourceType;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer, 
  options: { 
    folder?: string; 
    resource_type?: CloudinaryResourceType;
  } = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'sounds',
        resource_type: options.resource_type || 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryUploadResult);
      }
    );

    // Convert buffer to stream and pipe to uploadStream
    const Readable = require('stream').Readable;
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
}

export default cloudinary;
