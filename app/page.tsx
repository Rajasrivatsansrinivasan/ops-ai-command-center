'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, BrainCircuit, DatabaseZap, Gauge, RadioTower } from 'lucide-react';
import { TelemetryResponse } from './lib/types';
import { MetricCard } from './components/MetricCard';
import { LiveChart } from './components/LiveChart';
import { AssetTable } from './components/AssetTable';
import { IncidentPanel } from './components/IncidentPanel';
import { fmt } from './lib/utils';

export default function Home() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [selectedSite, setSelectedSite] = useState('EVGO-SJC-014');
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    const res = await fetch(`/api/telemetry?minutes=260&seed=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store' });
    const json: TelemetryResponse = await res.json();
    setData(json);
    if (!json.latest.some(row => row.siteId === selectedSite)) setSelectedSite(json.latest[0]?.siteId ?? 'EVGO-SJC-014');
    setRefreshing(false);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 7000);
    return () => clearInterval(id);
  }, []);

  const selected = useMemo(() => data?.latest.find(row => row.siteId === selectedSite) ?? data?.latest[0], [data, selectedSite]);

  return (
    <main className="relative min-h-screen overflow-hidden pb-12">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
      <section className="relative mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        <nav className="glass mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-soft"><BrainCircuit size={24} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">OpsAI Command Center</p>
              <h1 className="text-xl font-semibold text-slate-950">Real-Time Operational Monitoring</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700">Live API refresh: 7s</span>
            <a href="/api/export" className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 shadow-sm hover:bg-slate-50">Export scored CSV</a>
          </div>
        </nav>

        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">Built for EV charging, utility, healthcare, and manufacturing operations analytics</p>
            <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">An AI-powered operations dashboard for anomaly detection, alerts, and executive triage.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">The system streams time-series operational telemetry, learns rolling baselines, scores abnormal behavior with a z-score plus isolation-style ensemble, forecasts expected load, and converts incidents into clear business actions.</p>
          </div>
          <div className="glass rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Selected asset</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">{selected?.siteId ?? 'Loading'}</h3>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><RadioTower size={24} /></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4"><p className="text-slate-500">Root cause</p><p className="mt-1 font-semibold text-slate-900">{selected?.rootCause ?? 'Learning baseline'}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4"><p className="text-slate-500">Model score</p><p className="mt-1 text-2xl font-semibold text-slate-900">{selected ? Math.round(selected.anomalyScore) : '--'}</p></div>
            </div>
            <p className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">{selected?.recommendation ?? 'Loading model recommendation.'}</p>
          </div>
        </div>

        {data && (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <div className="xl:col-span-1"><MetricCard title="Assets" value={String(data.kpis.totalAssets)} detail="Monitored across four operations domains" icon={DatabaseZap} /></div>
              <div className="xl:col-span-1"><MetricCard title="Critical" value={String(data.kpis.criticalAlerts)} detail="Immediate investigation queue" icon={AlertTriangle} trend="down" /></div>
              <div className="xl:col-span-1"><MetricCard title="Warnings" value={String(data.kpis.warningAlerts)} detail="Deviation above learned baseline" icon={Activity} /></div>
              <div className="xl:col-span-1"><MetricCard title="Availability" value={`${fmt(data.kpis.averageAvailability)}%`} detail="Average latest asset health" icon={Gauge} trend="up" /></div>
              <div className="xl:col-span-1"><MetricCard title="Utilization" value={`${fmt(data.kpis.averageUtilization)}%`} detail="Demand and capacity pressure" icon={RadioTower} /></div>
              <div className="xl:col-span-1"><MetricCard title="Confidence" value={`${fmt(data.kpis.modelConfidence)}%`} detail="Baseline stability estimate" icon={BrainCircuit} /></div>
            </div>

            <div className="mt-8">
              <AssetTable rows={data.latest} selectedSite={selectedSite} onSelect={setSelectedSite} />
            </div>

            <div className="mt-8">
              <LiveChart records={data.records} siteId={selectedSite} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
              <IncidentPanel incidents={data.incidents} />
              <div className="glass rounded-3xl p-5">
                <h3 className="text-lg font-semibold text-slate-950">Architecture</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">This Vercel application uses API routes as the ingestion and scoring layer. The frontend polls the telemetry API to simulate streaming updates. The model layer performs feature normalization, robust isolation distance, residual forecasting, severity classification, and incident summarization.</p>
                <div className="mt-5 space-y-3">
                  {['Telemetry ingestion API', 'Feature engineering and baselines', 'Z-score residual detection', 'Isolation-style multivariate scoring', 'Forecast and deviation analysis', 'AI incident summary and action plan'].map(step => (
                    <div key={step} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-700">{step}</div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Refresh state: {refreshing ? 'updating model scores' : `synced at ${new Date(data.generatedAt).toLocaleTimeString()}`}</div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
