import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Determine base URL for calling /api/embed
const vercelUrl = Deno.env.get('VERCEL_URL');
const apiBase = vercelUrl
  ? vercelUrl.startsWith('https')
    ? vercelUrl
    : `https://${vercelUrl}`
  : 'http://localhost:3000';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log("➡️ Received body:", JSON.stringify(body));

    const { record } = body;
    if (!record?.id) {
      console.error("❌ No 'record.id' found in webhook payload");
      return new Response("Missing 'record.id'", { status: 400 });
    }

    const docId = record.id;
    console.log("📄 Document ID:", docId);
    console.log("🌍 Calling embed endpoint at:", `${apiBase}/api/embed`);

    const embedRes = await fetch(`${apiBase}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-role-secret': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      },
      body: JSON.stringify({ docId }),
    });

    const embedText = await embedRes.text();
    console.log("📬 Response from /api/embed:", embedRes.status, embedText);

    return new Response(embedText, { status: embedRes.status });
  } catch (e) {
    console.error("🔥 Uncaught error in queue-embed:", e);
    return new Response(e?.message ?? "Unknown error", { status: 500 });
  }
});
