import { NextResponse } from 'next/server';
import { generateTelemetry } from '@/app/lib/data';
import { scoreTelemetry, summarizeIncidents } from '@/app/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seed = Math.floor(Date.now() / 60_000);
  const incidents = summarizeIncidents(scoreTelemetry(generateTelemetry(260, seed)));
  return NextResponse.json({ generatedAt: new Date().toISOString(), incidents });
}
