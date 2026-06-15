import { IncidentSummary, ScoredPoint, TelemetryPoint } from './types';

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
}
function std(values: number[]) {
  const m = mean(values);
  const variance = mean(values.map(v => Math.pow(v - m, 2)));
  return Math.sqrt(variance) || 1;
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function rollingForecast(values: number[], alpha = 0.42) {
  if (!values.length) return [];
  let forecast = values[0];
  return values.map(value => {
    const previous = forecast;
    forecast = alpha * value + (1 - alpha) * forecast;
    return previous;
  });
}
function quantile(values: number[], q: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base] ?? 0;
}

function robustDistance(point: TelemetryPoint, medians: Record<string, number>, iqrs: Record<string, number>) {
  const features = ['availability', 'energyKw', 'sessionDemand', 'latencyMs', 'errorRate', 'temperatureC', 'throughput', 'utilization'] as const;
  const weights: Record<(typeof features)[number], number> = {
    availability: 1.4,
    energyKw: 0.9,
    sessionDemand: 1.0,
    latencyMs: 1.25,
    errorRate: 1.55,
    temperatureC: 0.75,
    throughput: 1.1,
    utilization: 1.0
  };
  const total = features.reduce((sum, feature) => {
    const normalized = Math.abs((point[feature] - medians[feature]) / (iqrs[feature] || 1));
    return sum + normalized * weights[feature];
  }, 0);
  return total / features.length;
}

function rootCause(row: TelemetryPoint) {
  const drivers = [
    { name: 'error rate spike', value: row.errorRate, threshold: 5.4 },
    { name: 'latency degradation', value: row.latencyMs, threshold: 235 },
    { name: 'availability drop', value: 100 - row.availability, threshold: 7 },
    { name: 'utilization surge', value: row.utilization, threshold: 88 },
    { name: 'temperature stress', value: row.temperatureC, threshold: 39 }
  ].filter(item => item.value >= item.threshold);
  if (!drivers.length) return 'normal operating variance';
  return drivers.map(d => d.name).join(', ');
}

function recommendation(cause: string, assetType: TelemetryPoint['assetType']) {
  if (cause.includes('availability')) return `Dispatch field verification for ${assetType.toLowerCase()} availability and compare against maintenance logs.`;
  if (cause.includes('error rate')) return 'Inspect recent failed transactions, API responses, device fault codes, and retry patterns.';
  if (cause.includes('latency')) return 'Check upstream dependency latency, network saturation, and batch processing backlog.';
  if (cause.includes('temperature')) return 'Validate cooling, ambient load, and thermal sensor drift before peak utilization period.';
  if (cause.includes('utilization')) return 'Increase capacity buffer, rebalance load, and monitor for demand clustering.';
  return 'Continue monitoring and keep the asset in the baseline learning window.';
}

export function scoreTelemetry(records: TelemetryPoint[]): ScoredPoint[] {
  const bySite = new Map<string, TelemetryPoint[]>();
  for (const row of records) {
    bySite.set(row.siteId, [...(bySite.get(row.siteId) ?? []), row]);
  }

  const scored: ScoredPoint[] = [];
  for (const [, siteRows] of bySite) {
    const metric = siteRows.map(r => r.errorRate * 14 + r.latencyMs / 30 + (100 - r.availability) * 2.4 + r.utilization / 12);
    const forecasts = rollingForecast(metric);
    const residuals = metric.map((v, idx) => v - forecasts[idx]);
    const residualMean = mean(residuals);
    const residualStd = std(residuals);

    const features = ['availability', 'energyKw', 'sessionDemand', 'latencyMs', 'errorRate', 'temperatureC', 'throughput', 'utilization'] as const;
    const medians: Record<string, number> = {};
    const iqrs: Record<string, number> = {};
    for (const feature of features) {
      const vals = siteRows.map(r => r[feature]);
      medians[feature] = quantile(vals, 0.5);
      iqrs[feature] = Math.max(quantile(vals, 0.75) - quantile(vals, 0.25), 0.1);
    }

    siteRows.forEach((row, idx) => {
      const zScore = Math.abs((residuals[idx] - residualMean) / residualStd);
      const isolationScore = robustDistance(row, medians, iqrs);
      const operatingPenalty = Math.max(0, row.errorRate - 3) * 0.55 + Math.max(0, 97 - row.availability) * 0.35 + Math.max(0, row.latencyMs - 180) / 115;
      const anomalyScore = clamp((zScore * 0.42 + isolationScore * 0.43 + operatingPenalty * 0.55) * 18, 0, 100);
      const severity: ScoredPoint['severity'] = anomalyScore >= 72 ? 'Critical' : anomalyScore >= 52 ? 'Warning' : anomalyScore >= 34 ? 'Watch' : 'Normal';
      const cause = rootCause(row);
      scored.push({
        ...row,
        zScore,
        isolationScore,
        forecast: forecasts[idx],
        residual: residuals[idx],
        anomalyScore,
        severity,
        rootCause: cause,
        recommendation: recommendation(cause, row.assetType)
      });
    });
  }
  return scored.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function summarizeIncidents(scored: ScoredPoint[]): IncidentSummary[] {
  const latestBySite = new Map<string, ScoredPoint>();
  for (const row of scored) latestBySite.set(row.siteId, row);
  return [...latestBySite.values()]
    .filter(row => row.severity !== 'Normal')
    .sort((a, b) => b.anomalyScore - a.anomalyScore)
    .slice(0, 6)
    .map(row => {
      const drivers = row.rootCause === 'normal operating variance' ? ['baseline variance'] : row.rootCause.split(', ');
      return {
        id: `${row.siteId}-${new Date(row.timestamp).getTime()}`,
        title: `${row.assetType} anomaly at ${row.siteId}`,
        siteId: row.siteId,
        severity: row.severity,
        startedAt: row.timestamp,
        score: Math.round(row.anomalyScore),
        narrative: `The monitoring model detected ${row.severity.toLowerCase()} deviation at ${row.siteId}. The ensemble score combined residual forecasting, z-score deviation, and robust isolation distance. Primary drivers are ${drivers.join(', ')}.`,
        probableDrivers: drivers,
        actionPlan: [
          row.recommendation,
          'Compare current values with same-hour historical baseline and recent deployment changes.',
          'Create an incident note, assign owner, and monitor the next fifteen-minute recovery window.'
        ]
      };
    });
}

export function buildKpis(scored: ScoredPoint[]) {
  const latest = latestRows(scored);
  return {
    totalAssets: latest.length,
    criticalAlerts: latest.filter(r => r.severity === 'Critical').length,
    warningAlerts: latest.filter(r => r.severity === 'Warning').length,
    averageAvailability: Number(mean(latest.map(r => r.availability)).toFixed(2)),
    averageUtilization: Number(mean(latest.map(r => r.utilization)).toFixed(2)),
    modelConfidence: Number(clamp(100 - mean(latest.map(r => Math.min(35, r.isolationScore * 5))), 72, 98).toFixed(1))
  };
}

export function latestRows(scored: ScoredPoint[]) {
  const latestBySite = new Map<string, ScoredPoint>();
  for (const row of scored) latestBySite.set(row.siteId, row);
  return [...latestBySite.values()].sort((a, b) => b.anomalyScore - a.anomalyScore);
}
