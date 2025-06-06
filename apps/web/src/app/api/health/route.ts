// Simple health-check Route Handler
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
