import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // auto-deploy as Vercel Edge Fn

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'PaperTrail AI';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#0c0c0d',
          color: 'white',
          width: '100%',
          height: '100%',
          padding: '80px 120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 32, marginTop: 20 }}>
          Zero-Cost, Privacy-First Document Vault
        </span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
