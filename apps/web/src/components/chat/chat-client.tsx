'use client';

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { pipeline } from '@xenova/transformers';

type Msg = { from: 'user' | 'bot'; text: string };

export default function ChatClient() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [engine, setEngine] = useState<string | null>(null);
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
    if (!input.trim()) return;
    const userMsg = { from: 'user' as const, text: input };
    setMsgs((m) => [...m, userMsg]);
    setInput('');
    setEngine(null);

    let vector: number[] = [];
    try {
      vector = await embedString(input);
    } catch (err) {
      toast.error('Embedding failed');
      return;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input, vector }),
    });

    if (!res.ok || !res.body) {
      toast.error(`Chat error: ${await res.text()}`);
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
  }

  return (
    <div className="border rounded-2xl p-4 space-y-4">
      <h2 className="text-xl font-semibold">Ask your vault 📄🤖</h2>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {msgs.map((m, i) => (
          <p key={i} className={m.from === 'user' ? 'text-right' : ''}>
            {m.from === 'user' ? (
              <Badge variant="outline">You</Badge>
            ) : (
              <Badge>Bot</Badge>
            )}{' '}
            {m.text}
          </p>
        ))}
      </div>

      {engine && (
        <p className="text-sm text-muted-foreground">
          ⚙️ Response powered by <strong>{engine}</strong>
        </p>
      )}

      <Textarea
        placeholder="Ask a question…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={2}
      />
      <Button onClick={handleSend} disabled={!input.trim()}>
        Send
      </Button>
    </div>
  );
}
