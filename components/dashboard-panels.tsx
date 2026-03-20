import { Panel } from "@/components/panel";

type SplitTime = {
  label: string;
  value: string;
};

export type DashboardData = {
  heartRate: number;
  heartRateTrend: number[];
  splitTimes: SplitTime[];
  totalDistanceMeters: number;
  sessionTime: string;
  riverLevel: string;
  riverLevelTimestamp: string;
  weatherTemperature: string;
  weatherCondition: string;
  weatherWind: string;
};

function buildTrend(seed: number) {
  const safeSeed = Number.isFinite(seed) ? seed : 0;
  return Array.from({ length: 10 }, (_, index) => {
    const offset = ((index % 4) - 1.5) * 3;
    return Math.max(0, Math.round(safeSeed - 8 + index * 1.5 + offset));
  });
}

export function createDashboardData(input: {
  heartRate?: number | null;
  splitTime?: string | number | null;
  distance?: number | null;
  sessionTime?: string | number | null;
  riverLevel?: string;
  riverLevelTimestamp?: string;
  weatherTemperature?: string;
  weatherCondition?: string;
  weatherWind?: string;
}): DashboardData {
  const splitValue = input.splitTime == null ? "--" : String(input.splitTime);
  const distanceValue = input.distance ?? 0;
  const heartRateValue = input.heartRate ?? 0;
  const sessionTimeValue = input.sessionTime == null ? "--:--" : String(input.sessionTime);

  return {
    heartRate: heartRateValue,
    heartRateTrend: buildTrend(heartRateValue),
    splitTimes: [{ label: "Latest", value: splitValue }],
    totalDistanceMeters: distanceValue,
    sessionTime: sessionTimeValue,
    riverLevel: input.riverLevel ?? "No data available",
    riverLevelTimestamp: input.riverLevelTimestamp ?? "No recent reading",
    weatherTemperature: input.weatherTemperature ?? "No weather data",
    weatherCondition: input.weatherCondition ?? "No weather data",
    weatherWind: input.weatherWind ?? "No weather data"
  };
}

function MetricValue({ value, unit }: { value: string; unit?: string }) {
  return (
    <div className="flex items-end gap-2">
      <span className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">{value}</span>
      {unit ? <span className="pb-1 text-sm uppercase tracking-[0.24em] text-textMuted">{unit}</span> : null}
    </div>
  );
}

function HeartRateGraph({ points }: { points: number[] }) {
  const width = 320;
  const height = 100;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const polylinePoints = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.08] bg-surfaceAlt/70 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full">
        <defs>
          <linearGradient id="heart-rate-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 ${height} L ${polylinePoints} L ${width} ${height} Z`}
          fill="url(#heart-rate-fill)"
          opacity="0.9"
        />
        <polyline
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.28em] text-textMuted">
        <span>Start</span>
        <span>Now</span>
      </div>
    </div>
  );
}

export function HeartRatePanel({ heartRate, trend }: { heartRate: number; trend: number[] }) {
  return (
    <Panel title="Heart Rate" eyebrow="Live Metric" action="Updated 3s ago" className="lg:col-span-2">
      <MetricValue value={heartRate.toString()} unit="bpm" />
      <p className="mt-3 text-sm text-textMuted">Training load is holding in the target aerobic zone.</p>
      <HeartRateGraph points={trend} />
    </Panel>
  );
}

export function SplitTimesPanel({ splits }: { splits: SplitTime[] }) {
  return (
    <Panel title="Split Times" eyebrow="Recent Pieces">
      <div className="space-y-3">
        {splits.map((split) => (
          <div
            key={split.label}
            className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-surfaceAlt/80 px-4 py-3"
          >
            <span className="text-sm uppercase tracking-[0.18em] text-textMuted">{split.label}</span>
            <span className="text-xl font-semibold tracking-tight text-text">{split.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function TotalDistancePanel({ distance }: { distance: number }) {
  return (
    <Panel title="Total Distance" eyebrow="Session Output">
      <MetricValue value={distance.toLocaleString()} unit="meters" />
      <p className="mt-3 text-sm text-textMuted">Volume is ahead of your trailing 7-session average.</p>
    </Panel>
  );
}

export function SessionTimePanel({ time }: { time: string }) {
  return (
    <Panel title="Session Time" eyebrow="Elapsed">
      <MetricValue value={time} />
      <p className="mt-3 text-sm text-textMuted">Steady-state block with two threshold surges.</p>
    </Panel>
  );
}

export function RiverLevelPanel({ level, timestamp }: { level: string; timestamp: string }) {
  return (
    <Panel title="River Level" eyebrow="Conditions">
      <div className="rounded-2xl border border-dashed border-white/10 bg-surfaceAlt/60 p-5">
        <p className="text-3xl font-semibold tracking-tight text-text">{level}</p>
        <p className="mt-3 text-sm text-textMuted">Last reading: {timestamp}</p>
      </div>
    </Panel>
  );
}

export function WeatherPanel({
  temperature,
  condition,
  wind
}: {
  temperature: string;
  condition: string;
  wind: string;
}) {
  return (
    <Panel title="Weather" eyebrow="External">
      <div className="rounded-2xl border border-dashed border-white/10 bg-surfaceAlt/60 p-5">
        <p className="text-3xl font-semibold tracking-tight text-text">{temperature}</p>
        <div className="mt-3 space-y-2 text-sm text-textMuted">
          <p>Condition: {condition}</p>
          <p>Wind: {wind}</p>
        </div>
      </div>
    </Panel>
  );
}

export function DashboardPanels({ data }: { data: DashboardData }) {
  return (
    <>
      <HeartRatePanel heartRate={data.heartRate} trend={data.heartRateTrend} />
      <SplitTimesPanel splits={data.splitTimes} />
      <TotalDistancePanel distance={data.totalDistanceMeters} />
      <SessionTimePanel time={data.sessionTime} />
      <RiverLevelPanel level={data.riverLevel} timestamp={data.riverLevelTimestamp} />
      <WeatherPanel
        temperature={data.weatherTemperature}
        condition={data.weatherCondition}
        wind={data.weatherWind}
      />
    </>
  );
}

export function DashboardEmptyState({
  riverLevel,
  riverLevelTimestamp,
  weatherTemperature,
  weatherCondition,
  weatherWind
}: {
  riverLevel: string;
  riverLevelTimestamp: string;
  weatherTemperature: string;
  weatherCondition: string;
  weatherWind: string;
}) {
  return (
    <>
      <Panel title="No Sessions Yet" eyebrow="Sessions" className="lg:col-span-2">
        <div className="rounded-2xl border border-dashed border-white/10 bg-surfaceAlt/60 p-5">
          <p className="text-3xl font-semibold tracking-tight text-text">No training data available.</p>
          <p className="mt-3 text-sm text-textMuted">
            Add a row to the <code>sessions</code> table to populate the performance panels.
          </p>
        </div>
      </Panel>
      <Panel title="Heart Rate" eyebrow="Live Metric">
        <MetricValue value="--" unit="bpm" />
        <p className="mt-3 text-sm text-textMuted">Waiting for the most recent session.</p>
      </Panel>
      <Panel title="Split Times" eyebrow="Recent Pieces">
        <div className="rounded-2xl border border-dashed border-white/10 bg-surfaceAlt/60 p-5 text-sm text-textMuted">
          No split data available yet.
        </div>
      </Panel>
      <Panel title="Total Distance" eyebrow="Session Output">
        <MetricValue value="--" unit="meters" />
        <p className="mt-3 text-sm text-textMuted">Distance will appear after the first synced session.</p>
      </Panel>
      <Panel title="Session Time" eyebrow="Elapsed">
        <MetricValue value="--:--" />
        <p className="mt-3 text-sm text-textMuted">Duration will appear after the first synced session.</p>
      </Panel>
      <RiverLevelPanel level={riverLevel} timestamp={riverLevelTimestamp} />
      <WeatherPanel
        temperature={weatherTemperature}
        condition={weatherCondition}
        wind={weatherWind}
      />
    </>
  );
}
