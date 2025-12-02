import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/documents - Upload a document and generate embedding
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, content, metadata } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Track analytics event
    await db
      .insertInto('analytics_events')
      .values({
        event_type: 'document_upload',
        event_data: JSON.stringify({ title, content_length: content.length }),
        user_session: request.headers.get('x-session-id') || 'anonymous',
      })
      .execute();

    // Generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${title}\n\n${content}`,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Insert document with embedding into TiDB
    await db
      .insertInto('documents')
      .values({
        title,
        content,
        embedding: JSON.stringify(embedding),
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .execute();

    return NextResponse.json({
      success: true,
      document: { title },
      message: 'Document uploaded and embedded successfully',
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/documents - List all documents
export async function GET() {
  try {
    const documents = await db
      .selectFrom('documents')
      .select(['id', 'title', 'content', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(50)
      .execute();

    return NextResponse.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: String(error) },
      { status: 500 }
    );
  }
}
