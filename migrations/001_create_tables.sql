-- PingCAP AI Demo - Database Schema Migration
-- Creates tables for vector search, RAG, and analytics features

-- Documents table with vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  embedding JSON NOT NULL COMMENT 'Vector embedding array for semantic search',
  metadata JSON NULL COMMENT 'Additional metadata (source, tags, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_title (title(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT 'Stores documents with vector embeddings for AI-powered semantic search';

-- Chat history for RAG-based conversational AI
CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  metadata JSON NULL COMMENT 'Context sources and additional info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_created (session_id, created_at),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT 'Chat conversation history for RAG-powered AI assistants';

-- Analytics events for real-time monitoring and insights
CREATE TABLE IF NOT EXISTS analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSON NOT NULL COMMENT 'Event payload and context',
  user_session VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type_created (event_type, created_at),
  INDEX idx_user_session (user_session),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT 'Real-time analytics events for AI workload monitoring';
