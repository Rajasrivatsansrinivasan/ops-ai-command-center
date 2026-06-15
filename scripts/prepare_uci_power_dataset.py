"""
Prepare a public UCI time-series sensor dataset for OpsAI Command Center.

Dataset: Individual Household Electric Power Consumption
Source: UCI Machine Learning Repository

Run:
    python scripts/prepare_uci_power_dataset.py

Output:
    data/uci_power_operational_sample.csv

This script uses only Python standard library modules. It downloads the UCI zip,
parses a limited number of rows, and maps electrical sensor measurements into an
operational-monitoring schema suitable for anomaly detection demos.
"""
from __future__ import annotations

import csv
import io
import math
import pathlib
import urllib.request
import zipfile
from datetime import datetime

URL = "https://archive.ics.uci.edu/static/public/235/individual+household+electric+power+consumption.zip"
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "uci_power_operational_sample.csv"
MAX_ROWS = 50000


def parse_float(value: str) -> float | None:
    if value == "?" or value.strip() == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def main() -> None:
    print("Downloading UCI power consumption dataset...")
    with urllib.request.urlopen(URL, timeout=90) as response:
        payload = response.read()

    with zipfile.ZipFile(io.BytesIO(payload)) as zf:
        txt_name = [name for name in zf.namelist() if name.endswith(".txt")][0]
        with zf.open(txt_name) as raw:
            text = io.TextIOWrapper(raw, encoding="latin-1")
            reader = csv.DictReader(text, delimiter=";")
            OUT.parent.mkdir(parents=True, exist_ok=True)
            with OUT.open("w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "timestamp",
                    "site_id",
                    "availability",
                    "session_demand",
                    "latency_ms",
                    "error_rate",
                    "utilization",
                    "source"
                ])
                written = 0
                for idx, row in enumerate(reader):
                    if written >= MAX_ROWS:
                        break
                    gap = parse_float(row.get("Global_active_power", ""))
                    voltage = parse_float(row.get("Voltage", ""))
                    intensity = parse_float(row.get("Global_intensity", ""))
                    sm1 = parse_float(row.get("Sub_metering_1", "")) or 0
                    sm2 = parse_float(row.get("Sub_metering_2", "")) or 0
                    sm3 = parse_float(row.get("Sub_metering_3", "")) or 0
                    if gap is None or voltage is None or intensity is None:
                        continue
                    try:
                        ts = datetime.strptime(f"{row['Date']} {row['Time']}", "%d/%m/%Y %H:%M:%S").isoformat()
                    except Exception:
                        continue

                    # Map household sensor signals into operations-style telemetry.
                    demand = gap * 100
                    utilization = max(0, min(99, intensity * 4.6))
                    latency = 95 + abs(voltage - 240) * 6 + (sm1 + sm2 + sm3) * 0.15
                    error_rate = max(0, abs(voltage - 240) / 18 + max(0, intensity - 16) * 0.22)
                    availability = max(70, min(100, 99.4 - error_rate * 1.4 - max(0, demand - 420) * 0.006))
                    site_id = f"UCI-PWR-{idx % 8:03d}"
                    writer.writerow([ts, site_id, round(availability, 3), round(demand, 3), round(latency, 3), round(error_rate, 3), round(utilization, 3), "UCI Household Electric Power Consumption"])
                    written += 1

    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
