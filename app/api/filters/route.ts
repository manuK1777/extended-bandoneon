import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all unique tags
    const tagsQuery = `
      SELECT DISTINCT h.tag
      FROM hashtags h
      JOIN entity_hashtags eh ON h.id = eh.hashtag_id
      WHERE eh.entity_type = 'sound'
      ORDER BY h.tag
    `;

    // Fetch all soundpacks
    const soundpacksQuery = `
      SELECT DISTINCT name
      FROM soundpacks
      WHERE name IS NOT NULL
      ORDER BY name
    `;

    const [tags, soundpacks] = await Promise.all([
      db.query<{ tag: string }>(tagsQuery),
      db.query<{ name: string }>(soundpacksQuery)
    ]);

    return NextResponse.json({
      tags: tags.map(t => t.tag),
      soundpacks: soundpacks.map(s => s.name)
    });

  } catch (error) {
    console.error('Error in /api/filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
