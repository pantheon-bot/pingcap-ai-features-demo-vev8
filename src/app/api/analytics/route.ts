import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sql } from 'kysely';

// GET /api/analytics - Get real-time analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';

    // Calculate time threshold
    const now = new Date();
    let timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours

    if (timeRange === '1h') {
      timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get event counts by type
    const eventCounts = await db
      .selectFrom('analytics_events')
      .select([
        'event_type',
        sql<number>`COUNT(*)`.as('count'),
      ])
      .where('created_at', '>=', timeThreshold)
      .groupBy('event_type')
      .execute();

    // Get total events
    const totalEvents = await db
      .selectFrom('analytics_events')
      .select(sql<number>`COUNT(*)`.as('count'))
      .where('created_at', '>=', timeThreshold)
      .executeTakeFirst();

    // Get unique sessions
    const uniqueSessions = await db
      .selectFrom('analytics_events')
      .select(sql<number>`COUNT(DISTINCT user_session)`.as('count'))
      .where('created_at', '>=', timeThreshold)
      .where('user_session', 'is not', null)
      .executeTakeFirst();

    // Get recent events
    const recentEvents = await db
      .selectFrom('analytics_events')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(20)
      .execute();

    // Get document count
    const documentStats = await db
      .selectFrom('documents')
      .select(sql<number>`COUNT(*)`.as('total_documents'))
      .executeTakeFirst();

    // Get chat message count
    const chatStats = await db
      .selectFrom('chat_history')
      .select([
        sql<number>`COUNT(*)`.as('total_messages'),
        sql<number>`COUNT(DISTINCT session_id)`.as('unique_sessions'),
      ])
      .executeTakeFirst();

    return NextResponse.json({
      success: true,
      timeRange,
      summary: {
        totalEvents: totalEvents?.count || 0,
        uniqueSessions: uniqueSessions?.count || 0,
        totalDocuments: documentStats?.total_documents || 0,
        totalChatMessages: chatStats?.total_messages || 0,
        activeChatSessions: chatStats?.unique_sessions || 0,
      },
      eventsByType: eventCounts,
      recentEvents: recentEvents.map(event => ({
        ...event,
        event_data: JSON.parse(event.event_data),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: String(error) },
      { status: 500 }
    );
  }
}
