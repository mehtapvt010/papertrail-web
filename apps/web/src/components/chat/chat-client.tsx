'use client';

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { pipeline } from '@xenova/transformers';
import { MessageCircle, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

type Msg = { from: 'user' | 'bot'; text: string };

export default function ChatClient() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [engine, setEngine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<ReadableStreamDefaultReader>(null);

  async function embedString(text: string): Promise<number[]> {
    toast.loading('Embedding query…');

    const extractor =
      (globalThis as any).__bge_extractor ??
      ((globalThis as any).__bge_extractor = await pipeline(
        'feature-extraction',
        'Xenova/bge-base-en-v1.5',
        {
          revision: 'main',
          quantized: true,
        }
      ));

    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    toast.dismiss();
    return Array.from(output.data as Float32Array);
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { from: 'user' as const, text: input };
    setMsgs((m) => [...m, userMsg]);
    setInput('');
    setEngine(null);
    setIsLoading(true);

    let vector: number[] = [];
    try {
      vector = await embedString(input);
    } catch (err) {
      toast.error('Embedding failed');
      setIsLoading(false);
      return;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input, vector }),
    });

    if (!res.ok || !res.body) {
      toast.error(`Chat error: ${await res.text()}`);
      setIsLoading(false);
      return;
    }

    const engineHeader = res.headers.get('x-papertrail-engine');
    if (engineHeader) setEngine(engineHeader);

    const reader = res.body.getReader();
    streamRef.current = reader;
    let botText = '';
    setMsgs((m) => [...m, { from: 'bot', text: '' }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      botText += new TextDecoder().decode(value);
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { from: 'bot', text: botText };
        return copy;
      });
    }
    
    setIsLoading(false);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Document Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask questions about your documents
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-6">
        <div className="max-h-80 overflow-y-auto space-y-4 mb-6">
          {msgs.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about your uploaded documents
              </p>
            </div>
          ) : (
            msgs.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.from === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.from === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.from === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Engine Info */}
        {engine && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Powered by <strong>{engine}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              placeholder="Ask a question about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              className="resize-none"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="lg"
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
