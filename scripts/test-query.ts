import db from '../src/lib/db';

async function testQuery() {
  try {
    console.log('Testing database query...');

    const docs = await db
      .selectFrom('documents')
      .select(['id', 'title'])
      .limit(3)
      .execute();

    console.log('Documents:', docs);

    // Get one document with embedding
    const docWithEmbedding = await db
      .selectFrom('documents')
      .selectAll()
      .limit(1)
      .executeTakeFirst();

    if (docWithEmbedding) {
      console.log('\nDocument ID:', docWithEmbedding.id);
      console.log('Title:', docWithEmbedding.title);
      console.log('Embedding length:', docWithEmbedding.embedding.length);
      console.log('Embedding start:', docWithEmbedding.embedding.substring(0, 100));

      try {
        const parsed = JSON.parse(docWithEmbedding.embedding);
        console.log('Parsed embedding length:', parsed.length);
        console.log('First 5 values:', parsed.slice(0, 5));
      } catch (e) {
        console.error('Failed to parse embedding:', e);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testQuery();
