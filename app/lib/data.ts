import { TelemetryPoint } from './types';
import { mulberry32, normal } from './seeded';

const sites = [
  { siteId: 'EVGO-SJC-014', region: 'California', assetType: 'EV Charger' as const, baseDemand: 72 },
  { siteId: 'EVGO-LA-032', region: 'California', assetType: 'EV Charger' as const, baseDemand: 68 },
  { siteId: 'ENT-NOLA-071', region: 'Louisiana', assetType: 'Grid Sensor' as const, baseDemand: 83 },
  { siteId: 'ENT-BTR-044', region: 'Louisiana', assetType: 'Grid Sensor' as const, baseDemand: 78 },
  { siteId: 'THC-API-008', region: 'Arizona', assetType: 'Clinic Queue' as const, baseDemand: 55 },
  { siteId: 'CHAS-SPO-019', region: 'Washington', assetType: 'Clinic Queue' as const, baseDemand: 49 },
  { siteId: 'MFG-AUS-006', region: 'Texas', assetType: 'Manufacturing Cell' as const, baseDemand: 62 },
  { siteId: 'MFG-RDU-011', region: 'North Carolina', assetType: 'Manufacturing Cell' as const, baseDemand: 60 }
];

export function generateTelemetry(minutes = 240, seed = 42): TelemetryPoint[] {
  const random = mulberry32(seed);
  const now = new Date();
  const rows: TelemetryPoint[] = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60_000);
    const hour = timestamp.getHours() + timestamp.getMinutes() / 60;
    const dayCycle = Math.sin((2 * Math.PI * hour) / 24);
    const demandCycle = 0.7 + 0.25 * Math.sin((2 * Math.PI * (hour - 7)) / 24);

    for (const site of sites) {
      const drift = Math.sin(i / 33 + site.baseDemand / 40) * 3;
      let shock = 0;
      let outage = 0;
      const activeIncidentA = site.siteId === 'EVGO-SJC-014' && i < 42 && i > 18;
      const activeIncidentB = site.siteId === 'ENT-NOLA-071' && i < 85 && i > 55;
      const activeIncidentC = site.siteId === 'THC-API-008' && i < 26;
      const activeIncidentD = site.siteId === 'MFG-AUS-006' && i < 130 && i > 112;

      if (activeIncidentA) { shock = 36; outage = 7; }
      if (activeIncidentB) { shock = 30; outage = 5; }
      if (activeIncidentC) { shock = 24; outage = 3; }
      if (activeIncidentD) { shock = 28; outage = 4; }

      const sessionDemand = Math.max(5, site.baseDemand * demandCycle + drift + normal(random, 0, 3) + shock * 0.4);
      const utilization = Math.min(99, Math.max(8, sessionDemand + normal(random, 0, 4) + shock * 0.25));
      const availability = Math.min(100, Math.max(62, 99 - outage - Math.max(0, shock * 0.12) + normal(random, 0, 0.9)));
      const errorRate = Math.max(0, 0.6 + normal(random, 0, 0.28) + shock * 0.11 + (100 - availability) * 0.05);
      const latencyMs = Math.max(55, 125 + normal(random, 0, 13) + shock * 3.6 + (site.assetType === 'Clinic Queue' ? 55 : 0));
      const energyKw = Math.max(10, sessionDemand * (site.assetType === 'EV Charger' ? 1.15 : 0.92) + normal(random, 0, 4) + dayCycle * 7);
      const temperatureC = Math.max(10, 27 + dayCycle * 8 + normal(random, 0, 1.6) + shock * 0.10);
      const throughput = Math.max(2, 95 - errorRate * 4 + utilization * 0.25 + normal(random, 0, 4));

      rows.push({
        timestamp: timestamp.toISOString(),
        siteId: site.siteId,
        region: site.region,
        assetType: site.assetType,
        availability,
        energyKw,
        sessionDemand,
        latencyMs,
        errorRate,
        temperatureC,
        throughput,
        utilization
      });
    }
  }
  return rows;
}
