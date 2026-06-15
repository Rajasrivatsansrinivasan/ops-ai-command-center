export type TelemetryPoint = {
  timestamp: string;
  siteId: string;
  region: string;
  assetType: 'EV Charger' | 'Grid Sensor' | 'Clinic Queue' | 'Manufacturing Cell';
  availability: number;
  energyKw: number;
  sessionDemand: number;
  latencyMs: number;
  errorRate: number;
  temperatureC: number;
  throughput: number;
  utilization: number;
};

export type ScoredPoint = TelemetryPoint & {
  zScore: number;
  isolationScore: number;
  forecast: number;
  residual: number;
  anomalyScore: number;
  severity: 'Normal' | 'Watch' | 'Warning' | 'Critical';
  rootCause: string;
  recommendation: string;
};

export type TelemetryResponse = {
  generatedAt: string;
  records: ScoredPoint[];
  latest: ScoredPoint[];
  kpis: {
    totalAssets: number;
    criticalAlerts: number;
    warningAlerts: number;
    averageAvailability: number;
    averageUtilization: number;
    modelConfidence: number;
  };
  incidents: IncidentSummary[];
};

export type IncidentSummary = {
  id: string;
  title: string;
  siteId: string;
  severity: ScoredPoint['severity'];
  startedAt: string;
  score: number;
  narrative: string;
  probableDrivers: string[];
  actionPlan: string[];
};
