import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FeatureInfo() {
  const features = [
    {
      title: 'Unified OLTP + OLAP + Vector Engine',
      description:
        'TiDB combines transactional, analytical, and vector search in one database. This demo stores documents, performs real-time queries, and executes vector similarity searches without separate systems.',
      badges: ['Zero ETL', 'Real-time Consistency', 'ACID Guarantees'],
      demoMapping: 'Document upload stores data with ACID guarantees, instantly available for search',
    },
    {
      title: 'Native Vector Search with Auto-Embedding',
      description:
        'Generate embeddings automatically on insert and perform semantic search using cosine similarity. No separate vector database needed.',
      badges: ['Semantic Search', 'Vector Embeddings', 'Hybrid Search'],
      demoMapping: 'Upload documents → auto-generates embeddings → search by meaning',
    },
    {
      title: 'RAG (Retrieval-Augmented Generation)',
      description:
        'Combine vector search with LLMs to create context-aware AI assistants that answer questions using your data in real-time.',
      badges: ['RAG', 'Context-Aware AI', 'Knowledge Base'],
      demoMapping: 'Chat tab retrieves relevant documents and generates responses with sources',
    },
    {
      title: 'Hybrid Search Capabilities',
      description:
        'Combine semantic vector search with traditional keyword/full-text search for the best of both worlds.',
      badges: ['Hybrid Search', 'Full-Text', 'Vector Search'],
      demoMapping: 'Search tab offers Semantic, Keyword, and Hybrid modes',
    },
    {
      title: 'Real-time Analytics & Monitoring',
      description:
        'Track events, user sessions, and AI workload metrics in real-time without separate analytics databases or ETL pipelines.',
      badges: ['Real-time', 'OLAP', 'Monitoring'],
      demoMapping: 'Every action generates analytics events tracked in real-time',
    },
    {
      title: 'MySQL-Compatible',
      description:
        'Use existing MySQL tools and libraries. This demo uses Kysely query builder with mysql2 driver for type-safe queries.',
      badges: ['MySQL Compatible', 'Standard SQL', 'Tool Support'],
      demoMapping: 'Built with standard Kysely + mysql2, no proprietary APIs',
    },
    {
      title: 'Elastic Auto-Scaling & Pay-per-Use',
      description:
        'TiDB Cloud Serverless scales automatically based on workload and bills by Request Units (RUs). No pre-provisioned capacity waste.',
      badges: ['Serverless', 'Auto-Scaling', 'Cost Efficient'],
      demoMapping: 'This demo runs on TiDB Cloud Serverless with automatic scaling',
    },
    {
      title: 'Agentic AI Workload Support',
      description:
        'Instant branching, copy-on-write storage, and multi-tenant isolation perfect for AI agents that spawn ephemeral environments.',
      badges: ['Instant Branching', 'Multi-tenant', 'Isolation'],
      demoMapping: 'Each chat session is isolated; can extend to per-agent branches',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">PingCAP AI Capabilities Demonstrated</h2>
        <p className="text-muted-foreground">
          How this demo maps to TiDB AI features from{' '}
          <a
            href="https://www.pingcap.com/ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 font-medium"
          >
            pingcap.com/ai
          </a>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {feature.badges.map((badge, i) => (
                  <Badge key={i} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-sm">{feature.description}</CardDescription>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-primary mb-1">In This Demo:</p>
                <p className="text-xs text-muted-foreground">{feature.demoMapping}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Database:</strong> TiDB Cloud Serverless (MySQL-compatible)
            </li>
            <li>
              <strong>Query Builder:</strong> Kysely (type-safe SQL) + mysql2 driver
            </li>
            <li>
              <strong>Framework:</strong> Next.js 16 with App Router (React Server Components)
            </li>
            <li>
              <strong>AI/ML:</strong> OpenAI API (text-embedding-3-small + gpt-4o-mini)
            </li>
            <li>
              <strong>UI:</strong> Tailwind CSS + shadcn/ui components
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
