import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface Article {
  id: number;
  title: string;
  abstract: string | null;
  author: string | null;
  pdf_url: string | null;
  slug: string;
}

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    const { slug } = context.params; 

    const query = `
      SELECT 
        id,
        title,
        abstract,
        author,
        pdf_url,
        slug
      FROM articles 
      WHERE slug = ?
    `;

    const articles = await db.query<Article>(query, [slug]);

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(articles[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
