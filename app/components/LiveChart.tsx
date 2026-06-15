'use client';

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Bar } from 'recharts';
import { ScoredPoint } from '@/app/lib/types';
import { timeLabel } from '@/app/lib/utils';

export function LiveChart({ records, siteId }: { records: ScoredPoint[]; siteId: string }) {
  const data = records.filter(r => r.siteId === siteId).slice(-90).map(r => ({
    time: timeLabel(r.timestamp),
    anomalyScore: Number(r.anomalyScore.toFixed(1)),
    errorRate: Number(r.errorRate.toFixed(2)),
    availability: Number(r.availability.toFixed(1)),
    latency: Number(r.latencyMs.toFixed(0)),
    forecast: Number(r.forecast.toFixed(1))
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Anomaly score and forecast residual</h3>
            <p className="text-sm text-slate-500">Ensemble score updates from the API refresh cycle.</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.18)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={22} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbeafe' }} />
              <Bar dataKey="anomalyScore" radius={[8, 8, 0, 0]} fill="rgba(37, 99, 235, 0.28)" />
              <Line type="monotone" dataKey="forecast" stroke="#0f766e" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-3xl p-5">
        <h3 className="text-lg font-semibold text-slate-950">Operational telemetry</h3>
        <p className="text-sm text-slate-500">Availability, error rate, and latency for the selected asset.</p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="availability" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="errorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.18)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={22} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #dbeafe' }} />
              <Area type="monotone" dataKey="availability" stroke="#2563eb" fill="url(#availability)" strokeWidth={2.3} />
              <Area type="monotone" dataKey="errorRate" stroke="#f59e0b" fill="url(#errorRate)" strokeWidth={2.3} />
              <Line type="monotone" dataKey="latency" stroke="#64748b" strokeWidth={1.8} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
