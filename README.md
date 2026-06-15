# OpsAI Command Center

Real-Time Operational Monitoring and Anomaly Detection Dashboard built for data analyst, data engineer, and operations analytics portfolios. The app is designed around EV charger network monitoring, but the same architecture maps to utility operations, healthcare operations, and manufacturing quality monitoring.

## Why this project is strong for analytics roles

This is not a basic dashboard. It demonstrates an end-to-end analytics workflow:

- Real-time telemetry ingestion through Vercel API routes
- Time-series feature engineering and rolling baselines
- Z-score residual anomaly detection
- Isolation-style multivariate outlier scoring
- Forecasting with exponential smoothing
- Severity classification and alerting
- AI-style incident summaries with root-cause drivers and action plans
- Live-refresh dashboard with interactive charts and downloadable scored CSV
- Light themed, polished, executive-ready UI

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Recharts
- Vercel serverless API routes
- Custom anomaly detection and forecasting engine in TypeScript

## Dataset approach

The project includes a realistic operational IoT telemetry sample at `data/sample_operational_iot.csv` and a built-in synthetic streaming generator for live demo purposes. For a public dataset version, adapt either of these:

1. UCI Air Quality dataset: hourly averaged responses from field-deployed air-quality chemical sensors.
2. UCI Individual Household Electric Power Consumption dataset: minute-level household power measurements across nearly four years.

Those datasets are excellent for anomaly detection because they are time-series sensor datasets with drift, missing values, and multivariate signals.

To prepare the UCI power dataset locally, run:

```bash
python scripts/prepare_uci_power_dataset.py
```

This creates `data/uci_power_operational_sample.csv`, which can be connected to the API layer when you want the demo to use downloaded public data instead of the built-in live generator.

## AI and model features

The model layer is in `app/lib/models.ts`.

It calculates:

- Rolling forecast baseline
- Forecast residual
- Residual z-score
- Robust median and IQR normalization
- Isolation-style multivariate distance
- Operating penalties for availability, error rate, and latency degradation
- Ensemble anomaly score from 0 to 100
- Severity label: Normal, Watch, Warning, Critical
- Probable root cause
- Recommended action plan
- Executive incident narrative

## Local run

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Vercel deployment

### Option 1: Deploy from GitHub

```bash
git init
git add .
git commit -m "Initial OpsAI Command Center project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ops-ai-command-center.git
git push -u origin main
```

Then go to Vercel:

- New Project
- Import your GitHub repo
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Deploy

### Option 2: Deploy using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

## Suggested repository name

`ops-ai-command-center`

Other strong options:

- `real-time-ops-anomaly-ai`
- `ai-ops-monitoring-dashboard`
- `ev-grid-health-analytics`
- `operational-intelligence-platform`

## Suggested resume bullet

Built a Vercel-deployed real-time operational monitoring platform using Next.js, TypeScript, and serverless APIs to ingest time-series telemetry, detect anomalies with z-score residuals and multivariate isolation-style scoring, forecast expected behavior, classify alert severity, and generate AI-style incident summaries for EV charging, utility, healthcare, and manufacturing operations use cases.

## Project structure

```text
app/
  api/
    telemetry/route.ts        Live telemetry and model scoring API
    incidents/route.ts        Incident summary API
    export/route.ts           Scored CSV export API
  components/                 Dashboard UI components
  lib/                        Data generator, models, types, utilities
  page.tsx                    Main dashboard
data/
  sample_operational_iot.csv  Sample operational time-series dataset
```

## How to make it even more advanced later

- Add a PostgreSQL/Supabase table for historical scored telemetry
- Add Kafka or Redpanda locally for true event streaming
- Add Slack/email alert webhooks
- Add OpenAI or Gemini API for natural-language incident summaries
- Add model monitoring metrics such as drift score and false-positive review queue
- Add role-based dashboards for analyst, operations manager, and executive users
