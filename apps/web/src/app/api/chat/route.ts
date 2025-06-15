/* apps/web/src/app/api/chat/route.ts
   PaperTrail AI – Supabase-only chat
   ▸ title-first search ▸ then type_enum ▸ then fuzzy fallback            */

   import { NextRequest } from 'next/server';
   import { z } from 'zod';
   import { Redis } from '@upstash/redis';
   import { Ratelimit } from '@upstash/ratelimit';
   import { createClient } from '@supabase/supabase-js';
   import { streamText } from 'ai';
   import { createOpenAI } from '@ai-sdk/openai';
   
   /* ---------- 0. Types & helpers ---------- */
   type DocMeta = {
     id: string;
     type_enum: string | null;
     title: string | null;
     expiry_date: string | null;
     uploaded_at: string | null;
   };
   
   const bodySchema = z.object({
     query: z.string().min(3),
     userKey: z.string().optional(),
   });
   
   const DOC_TYPE_MAP: Record<string, string> = {
     passport: 'passport',
     // licences / licenses
     licence: 'license',
     license: 'license',
     'driver licence': 'license',
     "driver's licence": 'license',
     'driver license': 'license',
     "driver's license": 'license',
     // IDs
     'id card': 'id_card',
     'national id': 'id_card',
     'driver id': 'id_card',
     'state id': 'id_card',
     visa: 'visa',
     insurance: 'insurance',
     policy: 'insurance',
   };
   
   const UPLOAD_WORDS = ['upload', 'uploaded', 'added', 'submitted'];
   
   function detectDocType(q: string): string | null {
     const lower = q.toLowerCase();
     for (const [kw, type] of Object.entries(DOC_TYPE_MAP)) {
       if (lower.includes(kw)) return type;
     }
     return null;
   }
   function detectField(q: string): 'expiry_date' | 'uploaded_at' {
     const l = q.toLowerCase();
     return UPLOAD_WORDS.some((w) => l.includes(w)) ? 'uploaded_at' : 'expiry_date';
   }
   function extractTitle(q: string): string | null {
     const m =
       /my\s+(.+?)\s+(?:expire|expires|expiry|upload|uploaded|added|submitted|\?)/i.exec(q);
     return m ? m[1].trim().toLowerCase() : null;
   }
   
   /* ---------- 1. Upstash RL ---------- */
   const redis = Redis.fromEnv();
   const ratelimit = new Ratelimit({
     redis,
     limiter: Ratelimit.slidingWindow(20, '1 m'),
   });
   
   /* ---------- 2. Supabase ---------- */
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     { auth: { persistSession: false } }
   );
   
   export const runtime = 'edge';
   
   /* ---------- 3. Handler ---------- */
   export async function POST(req: NextRequest) {
     const ip = req.headers.get('x-forwarded-for') ?? 'anon';
     if (!(await ratelimit.limit(ip)).success) return new Response('Rate limit', { status: 429 });
   
     const { query, userKey } = bodySchema.parse(await req.json());
   
     const titleLike = extractTitle(query);            // title if found
     const docType   = detectDocType(query);           // enum if keyword
     const field     = detectField(query);             // expiry_date | uploaded_at
   
     /* Build query – TITLE filter first, then type_enum, then fuzzy */
     let qb = supabase
       .from('documents')
       .select(
         ['id', 'type_enum', 'title', 'expiry_date', 'uploaded_at']
           .filter((c) => c === field || ['id', 'type_enum', 'title'].includes(c))
           .join(', ')
       )
       .order(field, { ascending: false })
       .limit(1);
   
     if (titleLike) {
       qb = qb.ilike('title', `%${titleLike}%`);
     } else if (docType) {
       qb = qb.eq('type_enum', docType);
     } else {
       const last = query.split(/\s+/).slice(-1)[0].toLowerCase();
       qb = qb.or(`type_enum.ilike.%${last}%,title.ilike.%${last}%`);
     }
   
     // optional user scoping
     const uid = req.headers.get('x-user-id');
     if (uid) qb = qb.eq('user_id', uid);
   
     const { data, error } = await qb;
     if (error) return new Response('Supabase error', { status: 500 });
   
     const doc = (data ?? [])[0] as any | undefined;
     const context = doc
       ? `[meta:${doc.id}] ` +
         (field === 'expiry_date'
           ? `Expiry: ${doc.expiry_date ?? 'unknown'}`
           : `Uploaded: ${doc.uploaded_at?.split('T')[0] ?? 'unknown'}`) +
         (doc.title ? ` • Title: ${doc.title}` : '') +
         (doc.type_enum ? ` • Type: ${doc.type_enum}` : '')
       : '';
   
     const prompt = `You are PaperTrail AI. Answer concisely from the context only.
   
   Context:
   ${context || 'N/A'}
   
   Question:
   ${query}`;
   
     /* ---------- HF → OpenAI fallback ---------- */
     let answer: string | ReadableStream | null = null;
     let engine = 'none';
   
     try {
       const hf = await fetch(
         `https://api-inference.huggingface.co/models/${process.env.LLAMA3_MODEL}`,
         {
           method: 'POST',
           headers: {
             Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ inputs: prompt }),
         }
       );
       if (hf.ok) {
         const j: any = await hf.json();
         answer = typeof j === 'string' ? j : j?.[0]?.generated_text ?? null;
         engine = `HF:${process.env.LLAMA3_MODEL}`;
       }
     } catch {}
   
     if (!answer && userKey) {
       try {
         const openai = createOpenAI({ apiKey: userKey, compatibility: 'strict' });
         const { textStream } = await streamText({
           model: openai.chat('gpt-4o'),
           messages: [
             { role: 'system', content: 'Answer concisely from the context only.' },
             { role: 'user', content: prompt },
           ],
         });
         answer = textStream;
         engine = 'OpenAI:gpt-4o';
       } catch {}
     }
   
     if (!answer) {
       answer = doc
         ? '📎 Found the document but cannot reach an AI model. Key info:\n' + context
         : '📎 No matching document found.';
       engine = 'Fallback';
     }
   
     return new Response(answer, {
       status: 200,
       headers: {
         'x-papertrail-engine': engine,
         'x-ratelimit-remaining': (await ratelimit.limit(ip)).remaining.toString(),
       },
     });
   }
   