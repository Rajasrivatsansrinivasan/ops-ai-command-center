import { NextResponse } from 'next/server';
import { generateTelemetry } from '@/app/lib/data';
import { scoreTelemetry } from '@/app/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  const scored = scoreTelemetry(generateTelemetry(240, Math.floor(Date.now() / 60_000)));
  const headers = Object.keys(scored[0] ?? {}).join(',');
  const lines = scored.map(row => Object.values(row).map(value => `"${String(value).replaceAll('"', '""')}"`).join(','));
  const csv = [headers, ...lines].join('\n');
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="ops_ai_anomaly_export.csv"'
    }
  });
}
