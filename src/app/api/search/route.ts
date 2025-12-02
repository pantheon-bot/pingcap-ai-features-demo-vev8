import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import OpenAI from 'openai';
import { sql } from 'kysely';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// POST /api/search - Semantic search with hybrid query support
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query, mode = 'semantic', limit = 5 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Track search event
    await db
      .insertInto('analytics_events')
      .values({
        event_type: 'search_query',
        event_data: JSON.stringify({ query, mode }),
        user_session: request.headers.get('x-session-id') || 'anonymous',
      })
      .execute();

    if (mode === 'keyword') {
      // Keyword search (traditional full-text)
      const results = await db
        .selectFrom('documents')
        .select(['id', 'title', 'content', 'created_at'])
        .where(
          sql`MATCH(title, content) AGAINST(${query} IN NATURAL LANGUAGE MODE)`,
          '>',
          sql`0`
        )
        .limit(limit)
        .execute();

      return NextResponse.json({
        success: true,
        mode: 'keyword',
        results,
        count: results.length,
      });
    }

    // Semantic search using vector embeddings
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Fetch all documents with embeddings
    const allDocuments = await db
      .selectFrom('documents')
      .selectAll()
      .execute();

    // Calculate similarity scores
    const documentsWithScores = allDocuments.map(doc => {
      const docEmbedding = typeof doc.embedding === 'string' ? JSON.parse(doc.embedding) : doc.embedding;
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding);

      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        created_at: doc.created_at,
        similarity_score: similarity,
      };
    });

    // Sort by similarity and return top results
    const results = documentsWithScores
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);

    if (mode === 'hybrid') {
      // Hybrid search: combine semantic + keyword search
      const keywordResults = await db
        .selectFrom('documents')
        .select(['id', 'title', 'content', 'created_at'])
        .where(
          sql`MATCH(title, content) AGAINST(${query} IN NATURAL LANGUAGE MODE)`,
          '>',
          sql`0`
        )
        .limit(limit)
        .execute();

      // Merge and deduplicate results
      const hybridResults = [...results];
      keywordResults.forEach(kw => {
        if (!hybridResults.find(r => r.id === kw.id)) {
          hybridResults.push({
            ...kw,
            similarity_score: 0.5, // Lower score for keyword-only matches
          });
        }
      });

      return NextResponse.json({
        success: true,
        mode: 'hybrid',
        results: hybridResults.slice(0, limit),
        count: hybridResults.length,
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'semantic',
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search', details: String(error) },
      { status: 500 }
    );
  }
}
