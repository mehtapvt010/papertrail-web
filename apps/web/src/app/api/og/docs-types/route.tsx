import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This key must be injected into Edge runtime via env vars on Vercel
  );

  const { data } = await supabase.from('admin_doc_type_counts').select('*');

  const labels = data?.map(d => d.type_enum) ?? [];
  const values = data?.map(d => d.cnt) ?? [];

  const chartText = labels.map((l, i) => `${l}: ${values[i]}`).join(' | ');

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#F3F4F6',
          padding: 40,
        }}
      >
        {chartText || 'No data yet'}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
