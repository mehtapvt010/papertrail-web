import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Zod schema to validate incoming request
const bodySchema = z.object({
  query: z.string().min(3),
  vector: z.array(z.number()).min(10),
  userKey: z.string().optional(), // Optional fallback OpenAI key
});

// Setup Redis rate limiting
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const identifier = req.headers.get('x-forwarded-for') ?? 'anon';
  const rl = await ratelimit.limit(identifier);

  if (!rl.success) {
    return new Response('Too many requests. Please try again shortly.', {
      status: 429,
    });
  }

  // Parse request body
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const { query, vector, userKey } = body;

  // 🔍 1. Qdrant vector search
  const qdrantRes = await fetch(
    `${process.env.NEXT_PUBLIC_QDRANT_URL}/collections/documents_embeddings/points/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.NEXT_PUBLIC_QDRANT_API_KEY!,
      },
      body: JSON.stringify({
        vector,
        top: 10,
        with_payload: true,
      }),
    }
  );

  if (!qdrantRes.ok) {
    return new Response('Qdrant search failed', { status: 502 });
  }

  const qdrantJson = await qdrantRes.json();
  const result: {
    id: string | number;
    score: number;
    payload: { doc_id: string; chunk: string };
  }[] = (qdrantJson as any).result ?? [];

  const context = result
    .filter((r) => r.payload?.doc_id && r.payload?.chunk)
    .map((r, i) => `[${i + 1}] (${r.payload.doc_id}) ${r.payload.chunk}`)
    .join('\n');


  // 🧠 2. Try Hugging Face Llama 3
  try {
    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${process.env.LLAMA3_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Context:\n${context}\n\nQuestion:\n${query}`,
        }),
      }
    );

    if (hfRes.ok) {
      const data = await hfRes.json();
      const answer =
        typeof data === 'string'
          ? data
          : (data as any)?.[0]?.generated_text ?? '🤖 No response generated.';

      return new Response(answer, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Model-Used': `HuggingFace:${process.env.LLAMA3_MODEL}`,
          'X-Ratelimit-Remaining': rl.remaining.toString(),
        },
      });
    }
  } catch (err) {
    console.error('Hugging Face call failed:', err);
  }

  // 🔁 3. Fallback to user-supplied OpenAI key
  if (userKey) {
    try {
      const openai = createOpenAI({
        apiKey: userKey,
        compatibility: 'strict',
      });

      const { textStream } = await streamText({
        model: openai.chat('gpt-4o'),
        messages: [
          {
            role: 'system',
            content:
              'You are PaperTrail AI. Only answer using the provided context. Cite sources like [1], [2].',
          },
          {
            role: 'user',
            content: `Context:\n${context}\n\nQuestion:\n${query}`,
          },
        ],
      });

      return new Response(textStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Model-Used': 'OpenAI:gpt-4o',
          'X-Ratelimit-Remaining': rl.remaining.toString(),
        },
      });
    } catch (err) {
      console.error('OpenAI fallback failed:', err);
    }
  }

  // 🪫 4. Final fallback message
  const fallback = `📎 We couldn't connect to any AI engine right now.

To keep PaperTrail AI free, we rely on Hugging Face's open models and optional OpenAI keys from users.

You can add an OpenAI key in Settings to enable richer answers.

For now, here’s what we found:

${context.slice(0, 800)}…`;

  return new Response(fallback, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'X-Model-Used': 'Fallback:ContextOnly',
      'X-Ratelimit-Remaining': rl.remaining.toString(),
    },
  });
}
