import db from '../src/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sampleDocuments = [
  {
    title: 'TiDB Vector Search Capabilities',
    content: 'TiDB provides native vector search functionality with automatic embedding generation. It supports cosine similarity, L2 distance, and inner product metrics for semantic search operations. The unified architecture eliminates the need for separate vector databases.',
  },
  {
    title: 'Real-time Analytics with TiDB',
    content: 'TiDB combines OLTP and OLAP workloads in a single database system. This enables real-time analytics on operational data without ETL pipelines. The HTAP architecture provides strong consistency and ACID guarantees across both transactional and analytical queries.',
  },
  {
    title: 'RAG Applications on TiDB',
    content: 'Retrieval-Augmented Generation (RAG) applications benefit from TiDB\'s unified data platform. You can store documents, generate embeddings, perform semantic search, and retrieve context for LLMs all in one database with zero ETL lag and real-time consistency.',
  },
  {
    title: 'Serverless Scaling for AI Workloads',
    content: 'TiDB Cloud Serverless provides elastic auto-scaling and pay-per-use pricing perfect for AI applications. It handles unpredictable AI agent workloads with instant branching, copy-on-write storage, and scale-to-zero capabilities to minimize costs.',
  },
  {
    title: 'Multi-tenant AI Architecture',
    content: 'TiDB supports multi-tenant isolation through instant branching, enabling each AI agent or tenant to have dedicated database environments. This solves the X tenants × Y agents × Z branches problem with copy-on-write storage efficiency.',
  },
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    for (const doc of sampleDocuments) {
      console.log(`\n📄 Processing: ${doc.title}`);
      console.log('   Generating embedding...');

      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `${doc.title}\n\n${doc.content}`,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Insert document
      await db
        .insertInto('documents')
        .values({
          title: doc.title,
          content: doc.content,
          embedding: JSON.stringify(embedding),
          metadata: JSON.stringify({ source: 'seed', category: 'tidb-ai' }),
        })
        .execute();

      console.log(`   ✅ Inserted document`);

      // Track analytics event
      await db
        .insertInto('analytics_events')
        .values({
          event_type: 'document_seed',
          event_data: JSON.stringify({ title: doc.title }),
          user_session: 'seed-script',
        })
        .execute();
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`📊 Total documents seeded: ${sampleDocuments.length}`);

    // Show stats
    const totalDocs = await db
      .selectFrom('documents')
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();

    console.log(`📈 Total documents in database: ${totalDocs?.count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
