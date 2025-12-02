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

// POST /api/chat - RAG-powered chat
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, sessionId = 'default', useContext = true } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Track chat event
    await db
      .insertInto('analytics_events')
      .values({
        event_type: 'chat_message',
        event_data: JSON.stringify({ message_length: message.length, useContext }),
        user_session: sessionId,
      })
      .execute();

    // Store user message
    await db
      .insertInto('chat_history')
      .values({
        session_id: sessionId,
        role: 'user',
        content: message,
        metadata: null,
      })
      .execute();

    let contextDocs: any[] = [];
    let systemPrompt = 'You are a helpful AI assistant.';

    if (useContext) {
      // Generate embedding for the user's message
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
      });

      const messageEmbedding = embeddingResponse.data[0].embedding;

      // Retrieve relevant documents from TiDB (RAG)
      const allDocuments = await db
        .selectFrom('documents')
        .selectAll()
        .execute();

      // Calculate similarity and get top 3 relevant documents
      contextDocs = allDocuments
        .map(doc => {
          const docEmbedding = typeof doc.embedding === 'string' ? JSON.parse(doc.embedding) : doc.embedding;
          const similarity = cosineSimilarity(messageEmbedding, docEmbedding);

          return {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            similarity_score: similarity,
          };
        })
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 3);

      // Build context-aware system prompt
      if (contextDocs.length > 0) {
        const contextText = contextDocs
          .map(doc => `Document: ${doc.title}\n${doc.content}`)
          .join('\n\n---\n\n');

        systemPrompt = `You are a helpful AI assistant with access to a knowledge base. Use the following documents to answer the user's question. If the documents don't contain relevant information, say so clearly.

Context Documents:
${contextText}`;
      }
    }

    // Get recent chat history for context
    const recentHistory = await db
      .selectFrom('chat_history')
      .select(['role', 'content'])
      .where('session_id', '=', sessionId)
      .orderBy('created_at', 'desc')
      .limit(10)
      .execute();

    // Reverse to get chronological order
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...recentHistory.reverse().slice(0, -1).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

    // Store assistant response
    await db
      .insertInto('chat_history')
      .values({
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage,
        metadata: JSON.stringify({
          sources: contextDocs.map(doc => ({
            id: doc.id,
            title: doc.title,
            similarity: doc.similarity_score,
          })),
        }),
      })
      .execute();

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      sources: contextDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity_score,
      })),
      sessionId,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/chat - Get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';

    const history = await db
      .selectFrom('chat_history')
      .selectAll()
      .where('session_id', '=', sessionId)
      .orderBy('created_at', 'asc')
      .execute();

    return NextResponse.json({
      success: true,
      history,
      sessionId,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history', details: String(error) },
      { status: 500 }
    );
  }
}
