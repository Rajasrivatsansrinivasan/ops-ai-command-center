import { NextResponse } from 'next/server';
import { generateTelemetry } from '@/app/lib/data';
import { buildKpis, latestRows, scoreTelemetry, summarizeIncidents } from '@/app/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minutes = Number(searchParams.get('minutes') ?? 240);
  const tick = Math.floor(Date.now() / 60_000);
  const seed = Number(searchParams.get('seed') ?? tick);
  const records = generateTelemetry(Math.min(Math.max(minutes, 60), 720), seed);
  const scored = scoreTelemetry(records);
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    records: scored,
    latest: latestRows(scored),
    kpis: buildKpis(scored),
    incidents: summarizeIncidents(scored)
  });
}
