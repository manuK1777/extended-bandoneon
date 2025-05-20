import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

interface SoundRecord {
  mp3_url: string;
  wav_url: string;
  title: string;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication - Get the session from the request
    const response = await fetch(`${new URL(request.url).origin}/api/auth/me`, {
      headers: request.headers
    });
    
    const authData = await response.json();
    
    // Check if user is authenticated
    if (!authData.authenticated || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get parameters
    const { searchParams } = new URL(request.url);
    const soundId = searchParams.get('id');
    const format = searchParams.get('format') || 'mp3'; // Default to mp3
    
    if (!soundId) {
      return NextResponse.json({ error: 'Sound ID is required' }, { status: 400 });
    }

    // 3. Query the database for the sound
    const query = `
      SELECT 
        mp3_url, 
        wav_url,
        title
      FROM sounds
      WHERE id = ?
    `;

    const rows = await db.query(query, [soundId]);
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Sound not found' }, { status: 404 });
    }

    // 4. Get the appropriate URL based on format
    const sound = rows[0] as SoundRecord;
    const fileUrl = format === 'wav' ? sound.wav_url : sound.mp3_url;
    const fileName = `${sound.title}.${format}`;
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'File not available' }, { status: 404 });
    }

    // 5. Return the URL and filename to the client
    return NextResponse.json({ 
      url: fileUrl,
      filename: fileName
    });
  } catch (error) {
    console.error('Error in /api/download:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
