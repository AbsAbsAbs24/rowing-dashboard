import { DashboardEmptyState, DashboardPanels, createDashboardData } from "@/components/dashboard-panels";
import { SessionForm } from "@/components/session-form";
import { getRiverLevelData } from "@/lib/river-level";
import { getSupabaseClient, type SessionRow } from "@/lib/supabase";
import { getWeatherData } from "@/lib/weather";

export const dynamic = "force-dynamic";

async function getLatestSession() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("id, created_at, heart_rate, split_time, distance, session_time")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch latest session", error);
      return null;
    }

    return data as SessionRow | null;
  } catch (error) {
    console.error("Failed to initialize Supabase client", error);
    return null;
  }
}

export default async function Page() {
  const [latestSession, riverLevelData, weatherData] = await Promise.all([
    getLatestSession(),
    getRiverLevelData(),
    getWeatherData()
  ]);
  const dashboardData = latestSession
    ? createDashboardData({
        heartRate: latestSession.heart_rate,
        splitTime: latestSession.split_time,
        distance: latestSession.distance,
        sessionTime: latestSession.session_time,
        riverLevel: riverLevelData.level,
        riverLevelTimestamp: riverLevelData.timestamp,
        weatherTemperature: weatherData.temperature,
        weatherCondition: weatherData.condition,
        weatherWind: weatherData.wind
      })
    : null;

  return (
    <main className="dashboard-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-accent">Athlete Dashboard</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              Performance snapshot for today&apos;s rowing session.
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-white/[0.08] bg-surface/80 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-textMuted">Status</p>
              <p className="mt-2 text-lg font-semibold text-success">On Pace</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-surface/80 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-textMuted">Focus</p>
              <p className="mt-2 text-lg font-semibold text-text">Threshold</p>
            </div>
          </div>
        </section>

        <SessionForm />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardData ? (
            <DashboardPanels data={dashboardData} />
          ) : (
            <DashboardEmptyState
              riverLevel={riverLevelData.level}
              riverLevelTimestamp={riverLevelData.timestamp}
              weatherTemperature={weatherData.temperature}
              weatherCondition={weatherData.condition}
              weatherWind={weatherData.wind}
            />
          )}
        </section>
      </div>
    </main>
  );
}
