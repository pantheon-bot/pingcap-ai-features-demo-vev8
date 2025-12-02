import DemoInterface from '@/components/demo-interface';
import FeatureInfo from '@/components/feature-info';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 space-y-12">
        <DemoInterface />
        <div className="border-t pt-12">
          <FeatureInfo />
        </div>
      </main>
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p className="mb-2">
            This demo showcases features from{' '}
            <a
              href="https://www.pingcap.com/ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              PingCAP AI / TiDB AI
            </a>
          </p>
          <p>
            Powered by TiDB Cloud Serverless + Next.js 16 + OpenAI
          </p>
        </div>
      </footer>
    </div>
  );
}
