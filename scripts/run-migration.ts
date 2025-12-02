import { readFileSync } from 'fs';
import { join } from 'path';
import db from '../src/lib/db';
import { sql } from 'kysely';

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');

    // Read migration file
    const migrationPath = join(process.cwd(), 'migrations', '001_create_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Remove comments and split by semicolon
    const cleanSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`  [${i + 1}/${statements.length}] Executing statement...`);
        await sql.raw(statement).execute(db);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - documents (with vector embeddings)');
    console.log('   - chat_history (for RAG conversations)');
    console.log('   - analytics_events (for real-time monitoring)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
