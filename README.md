# PingCAP AI Features Demo

An interactive demonstration of TiDB's AI-native database capabilities, showcasing features from [pingcap.com/ai](https://www.pingcap.com/ai/).

## Overview

This demo application illustrates key AI capabilities of TiDB Cloud Serverless:

- **Native Vector Search** with automatic embedding generation
- **Semantic & Hybrid Search** combining vector similarity and keyword search
- **RAG (Retrieval-Augmented Generation)** for context-aware AI chat
- **Real-time Analytics** tracking all interactions
- **Unified OLTP + OLAP + Vector Engine** in a single database
- **Zero ETL** with strong ACID guarantees

## Features Demonstrated

### 1. Vector Search with Auto-Embedding
- Upload documents and automatically generate embeddings via OpenAI
- Store embeddings as JSON in TiDB alongside document content
- Perform semantic search using cosine similarity
- All in one database - no separate vector store needed

### 2. Hybrid Search Capabilities
- **Semantic Search**: Find documents by meaning using vector similarity
- **Keyword Search**: Traditional full-text search using MySQL MATCH AGAINST
- **Hybrid Mode**: Combine both approaches for best results

### 3. RAG-Powered Chat
- Ask questions about your uploaded documents
- Automatically retrieves relevant context using vector search
- Generates responses with source attribution
- Maintains chat history with session isolation

### 4. Real-time Analytics
- Every action generates analytics events stored in TiDB
- Track document uploads, searches, and chat interactions
- Query analytics in real-time without separate OLAP database

### 5. MySQL Compatibility
- Uses standard Kysely query builder + mysql2 driver
- No proprietary APIs - familiar SQL patterns
- Type-safe queries with TypeScript

## Technology Stack

- **Database**: TiDB Cloud Serverless (MySQL-compatible)
- **Query Builder**: Kysely (type-safe SQL) + mysql2 driver
- **Framework**: Next.js 16 with App Router (React Server Components)
- **AI/ML**: OpenAI API (text-embedding-3-small + gpt-4o-mini)
- **UI**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- TiDB Cloud Serverless cluster
- OpenAI API key

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` at the repository root:
   ```bash
   DATABASE_URL=mysql://[user]:[password]@[host]/[database]
   OPENAI_API_KEY=sk-...
   ```

3. Run database migrations:
   ```bash
   npx tsx scripts/run-migration.ts
   ```

4. (Optional) Seed sample data:
   ```bash
   npx tsx scripts/seed-data.ts
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## Usage

### Document Upload Tab
1. Enter a document title and content
2. Click "Upload & Generate Embedding"
3. The system automatically generates vector embeddings via OpenAI
4. Document is stored in TiDB with ACID guarantees

### Semantic Search Tab
1. Enter a search query
2. Choose search mode (Semantic, Keyword, or Hybrid)
3. View ranked results with similarity scores

### RAG Chat Tab
1. Type a question about your documents
2. The system retrieves relevant documents and generates contextual responses
3. See source citations with similarity scores

### Documents Tab
1. Click "Load Documents" to view all uploaded documents
2. Demonstrates real-time data access with zero ETL lag

## How This Maps to PingCAP AI Features

| PingCAP AI Feature | Demo Implementation |
|-------------------|-------------------|
| **Unified OLTP + OLAP + Vector** | Documents stored with ACID guarantees, instantly queryable for analytics and vector search |
| **Native Vector Search** | Embeddings stored as JSON, searched using cosine similarity |
| **Zero ETL** | No data pipelines - write once, query for OLTP/OLAP/vector instantly |
| **Real-time Consistency** | All queries see latest data with strong consistency |
| **Semantic Search** | Vector similarity search with OpenAI embeddings |
| **Hybrid Search** | Combines vector search with MySQL full-text search |
| **RAG Support** | Document retrieval → context injection → LLM generation |
| **MySQL Compatible** | Standard Kysely + mysql2, no proprietary APIs |
| **Serverless Scaling** | Runs on TiDB Cloud Serverless with auto-scaling |
| **Real-time Analytics** | OLAP queries on operational data without ETL |

## Learn More

To learn more about this template, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [TiDB Cloud Starter Documents](https://docs.pingcap.com/tidbcloud/) - learn about TiDB Cloud.
  - [Vector search in TiDB](https://pingcap.github.io/ai/guides/vector-search/#__tabbed_1_2)
- [Kysely](https://kysely.dev/) - the type-safe SQL query builder for TypeScript
- [mysql2](https://github.com/sidorares/node-mysql2) - MySQL client for Node.js
- [shadcn/ui](https://ui.shadcn.com/) - a popular UI library for React.
