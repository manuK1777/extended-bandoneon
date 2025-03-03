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
) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');
    
    let query = `
      SELECT 
        id,
        title,
        abstract,
        author,
        pdf_url
      FROM articles
    `;

    const queryParams: (string | number)[] = [];

    if (articleId) {
      query += ` WHERE id = ?`;
      queryParams.push(articleId);
    }

    query += ` ORDER BY created_at DESC`;

    const rows = await db.query<Article>(query, queryParams);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No articles found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
          }
        }
      );
    }

    return NextResponse.json(
      articleId ? rows[0] : rows,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
