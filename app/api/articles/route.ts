import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  abstract: string | null;
  author: string | null;
  pdf_url: string | null;
  slug: string;
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
        pdf_url,
        slug
      FROM articles
    `;

    const queryParams: (string | number)[] = [];

    if (articleId) {
      query += ` WHERE id = ?`;
      queryParams.push(articleId);
    }

    query += ` ORDER BY created_at DESC`;

    const articles = await db.query<Article>(query, queryParams);

    if (!articles || articles.length === 0) {
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
      articleId ? articles[0] : articles,
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

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { title, abstract, author, pdf_url } = body;
    
    // Generate slug from title
    const baseSlug = generateSlug(title);
    
    // Check if slug exists and add number if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.query(
        'SELECT id FROM articles WHERE slug = ?',
        [slug]
      );
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const query = `
      INSERT INTO articles (title, abstract, author, pdf_url, slug)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id, title, abstract, author, pdf_url, slug
    `;
    
    const values = [title, abstract, author, pdf_url, slug];
    const result = await db.query<Article>(query, values);
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
