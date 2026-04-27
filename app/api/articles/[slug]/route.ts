import { NextResponse } from 'next/server';
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
  request: Request
) {
  try {
    const { pathname } = new URL(request.url);
    const slug = pathname.split('/').pop();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid article slug' },
        { status: 400 }
      );
    }

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

export async function PUT(
  request: Request
) {
  try {
    const { pathname } = new URL(request.url);
    const slug = pathname.split('/').pop();

    if (!slug) {
      return NextResponse.json({ error: 'Invalid article slug' }, { status: 400 });
    }

    const existing = await db.query<Article>(
      'SELECT id FROM articles WHERE slug = ?',
      [slug]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, abstract, author, pdf_url, publisher, publication_info, slug: newSlug } = body;

    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (title !== undefined)            { fields.push('title = ?');            values.push(title); }
    if (abstract !== undefined)         { fields.push('abstract = ?');         values.push(abstract); }
    if (author !== undefined)           { fields.push('author = ?');           values.push(author); }
    if (pdf_url !== undefined)          { fields.push('pdf_url = ?');          values.push(pdf_url); }
    if (publisher !== undefined)        { fields.push('publisher = ?');        values.push(publisher); }
    if (publication_info !== undefined) { fields.push('publication_info = ?'); values.push(publication_info); }
    if (newSlug !== undefined)          { fields.push('slug = ?');             values.push(newSlug); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(slug);
    await db.query(`UPDATE articles SET ${fields.join(', ')} WHERE slug = ?`, values);

    const updated = await db.query<Article>(
      'SELECT id, title, abstract, author, pdf_url, slug, publisher, publication_info FROM articles WHERE slug = ?',
      [newSlug ?? slug]
    );

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}
