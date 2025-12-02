"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface SearchResult extends Document {
  similarity_score?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ id: number; title: string; similarity: number }>;
}

export default function DemoInterface() {
  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword' | 'hybrid'>('semantic');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  // Documents list state
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleUploadDocument = async () => {
    if (!docTitle || !docContent) {
      setUploadStatus('Please provide both title and content');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Generating embeddings and uploading...');

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: docTitle, content: docContent }),
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus('✅ Document uploaded successfully!');
        setDocTitle('');
        setDocContent('');
        // Refresh documents list
        loadDocuments();
      } else {
        setUploadStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Failed to upload: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, mode: searchMode, limit: 5 }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId, useContext: true }),
      });

      const data = await response.json();

      if (data.success) {
        setChatHistory(prev => [
          ...prev,
          { role: 'assistant', content: data.message, sources: data.sources },
        ]);
      }
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setIsChatting(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">PingCAP AI Features Demo</h1>
        <p className="text-lg text-muted-foreground">
          Showcasing TiDB&apos;s AI-native database capabilities
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="search">Semantic Search</TabsTrigger>
          <TabsTrigger value="chat">RAG Chat</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document with Auto-Embedding</CardTitle>
              <CardDescription>
                <Badge className="mr-2">Vector Search</Badge>
                <Badge className="mr-2">Real-time Consistency</Badge>
                Demonstrates TiDB&apos;s native vector search with automatic embedding generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Title</label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Enter document title..."
                  disabled={isUploading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Document Content</label>
                <Textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Enter document content..."
                  rows={6}
                  disabled={isUploading}
                />
              </div>
              <Button onClick={handleUploadDocument} disabled={isUploading} className="w-full">
                {isUploading ? 'Uploading...' : 'Upload & Generate Embedding'}
              </Button>
              {uploadStatus && (
                <div className="p-3 bg-muted rounded-md text-sm">{uploadStatus}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semantic & Hybrid Search</CardTitle>
              <CardDescription>
                <Badge className="mr-2">Semantic Search</Badge>
                <Badge className="mr-2">Hybrid Search</Badge>
                <Badge className="mr-2">Unified OLTP+OLAP</Badge>
                Search using meaning, keywords, or both combined
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Search Query</label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={searchMode === 'semantic' ? 'default' : 'outline'}
                  onClick={() => setSearchMode('semantic')}
                  size="sm"
                >
                  Semantic
                </Button>
                <Button
                  variant={searchMode === 'keyword' ? 'default' : 'outline'}
                  onClick={() => setSearchMode('keyword')}
                  size="sm"
                >
                  Keyword
                </Button>
                <Button
                  variant={searchMode === 'hybrid' ? 'default' : 'outline'}
                  onClick={() => setSearchMode('hybrid')}
                  size="sm"
                >
                  Hybrid
                </Button>
              </div>
              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                {isSearching ? 'Searching...' : 'Search Documents'}
              </Button>
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <Card key={result.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{result.title}</CardTitle>
                      {result.similarity_score !== undefined && (
                        <Badge variant="secondary">
                          Similarity: {(result.similarity_score * 100).toFixed(1)}%
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG-Powered Chat</CardTitle>
              <CardDescription>
                <Badge className="mr-2">RAG</Badge>
                <Badge className="mr-2">Real-time Analytics</Badge>
                <Badge className="mr-2">Context-Aware</Badge>
                Chat with your documents using Retrieval-Augmented Generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-96 overflow-y-auto border rounded-md p-4 space-y-3">
                {chatHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Start a conversation! Your messages will be enhanced with relevant context from
                    uploaded documents.
                  </p>
                )}
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-muted mr-12'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium mb-1">Sources:</p>
                        {msg.sources.map((source, i) => (
                          <Badge key={i} variant="outline" className="text-xs mr-1">
                            {source.title} ({(source.similarity * 100).toFixed(0)}%)
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isChatting && (
                  <div className="bg-muted p-3 rounded-lg mr-12">
                    <p className="text-sm">Thinking...</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question about your documents..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isChatting}
                />
                <Button onClick={handleSendMessage} disabled={isChatting}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                <Badge className="mr-2">Zero ETL Lag</Badge>
                <Badge className="mr-2">ACID Guarantees</Badge>
                All uploaded documents with real-time consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadDocuments} className="mb-4">
                Load Documents
              </Button>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{doc.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Created: {new Date(doc.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-2">{doc.content}</p>
                    </CardContent>
                  </Card>
                ))}
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No documents yet. Upload some documents to get started!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
