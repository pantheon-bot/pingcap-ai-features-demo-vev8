import { Generated } from 'kysely';

export interface DB {
  documents: {
    id: Generated<number>;
    title: string;
    content: string;
    embedding: string; // JSON string of vector array
    metadata: string | null; // JSON string for additional metadata
    created_at: Generated<Date>;
  };

  chat_history: {
    id: Generated<number>;
    session_id: string;
    role: 'user' | 'assistant';
    content: string;
    metadata: string | null; // JSON string for context/sources
    created_at: Generated<Date>;
  };

  analytics_events: {
    id: Generated<number>;
    event_type: string;
    event_data: string; // JSON string
    user_session: string | null;
    created_at: Generated<Date>;
  };
}