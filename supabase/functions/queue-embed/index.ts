// supabase/functions/queue-embed/index.ts
import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2';

// Setup Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Get Vercel deployment URL
const vercelUrl = Deno.env.get('VERCEL_URL');
const apiBase = vercelUrl?.startsWith('https')
  ? vercelUrl
  : `https://${vercelUrl ?? 'localhost:3000'}`;

console.log(`🌐 API base URL: ${apiBase}`);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { record } = body;

    if (!record?.id) {
      return new Response("Missing 'record.id'", { status: 400 });
    }

    const docId = record.id;
    console.log("📄 Received docId:", docId);

    // Optional: Wait to ensure OCR is populated
    console.log("⏱️ Waiting 5s to allow OCR to finish...");
    await new Promise((res) => setTimeout(res, 5000));

    // Trigger embed API
    const embedRes = await fetch(`${apiBase}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-role-secret': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      },
      body: JSON.stringify({ docId }),
    });

    const result = await embedRes.text();
    console.log("📬 Response from /api/embed:", embedRes.status, result);
    return new Response(result, { status: embedRes.status });
  } catch (e) {
    console.error("🔥 Error in queue-embed:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
