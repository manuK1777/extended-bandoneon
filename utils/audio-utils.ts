import { exec } from 'child_process';
import { promisify } from 'util';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';

const execAsync = promisify(exec);

interface AudioConversionResult {
  buffer: Buffer;
  duration: number;
}

export async function convertWavToMp3(wavBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable.push(wavBuffer);
    readable.push(null);

    const chunks: Buffer[] = [];
    ffmpeg(readable)
      .toFormat('mp3')
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on('data', (chunk) => chunks.push(chunk));
  });
}

export async function getAudioDuration(file: File): Promise<number> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    ffmpeg(readable)
      .ffprobe((err, data) => {
        if (err) return reject(err);
        resolve(data.format.duration || 0);
      });
  });
}
