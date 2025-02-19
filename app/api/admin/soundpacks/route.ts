import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Soundpack extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  cover_image_url: string | null;
}

export async function GET() {
  try {
    const soundpacks = await db.query<Soundpack>(
      'SELECT id, name, description, cover_image_url FROM soundpacks ORDER BY name ASC'
    );
    
    return NextResponse.json(soundpacks);
  } catch (error) {
    console.error('Error fetching soundpacks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soundpacks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, cover_image_url } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if soundpack with same name already exists
    const existing = await db.query<Soundpack>(
      'SELECT id FROM soundpacks WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A soundpack with this name already exists' },
        { status: 400 }
      );
    }

    const result = await db.execute(
      'INSERT INTO soundpacks (name, description, cover_image_url) VALUES (?, ?, ?)',
      [name, description || null, cover_image_url || null]
    );

    const newSoundpack = {
      id: result.insertId,
      name,
      description,
      cover_image_url,
    };

    return NextResponse.json(newSoundpack, { status: 201 });
  } catch (error) {
    console.error('Error creating soundpack:', error);
    return NextResponse.json(
      { error: 'Failed to create soundpack' },
      { status: 500 }
    );
  }
}
