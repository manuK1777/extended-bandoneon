import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Article {
  id: number;
  title: string;
  abstract: string | null;
  author: string | null;
  pdf_url: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = `
      SELECT 
        id,
        title,
        abstract,
        author,
        pdf_url
      FROM articles
      WHERE id = ?
    `;

    const rows = await db.query<Article>(query, [params.id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
