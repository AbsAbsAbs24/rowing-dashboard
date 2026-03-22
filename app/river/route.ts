export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://environment.data.gov.uk/flood-monitoring/id/stations/6169", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json({
        level: "No data available",
        timestamp: "No recent reading",
        trend: "Unknown",
        state: "Unknown"
      });
    }

    const data = await res.json();

    const measure = data.items.measures.find((m: any) => m.parameter === "level");

    if (!measure || !measure.latestReading) {
      return Response.json({
        level: "No data available",
        timestamp: "No recent reading",
        trend: "Unknown",
        state: "Unknown"
      });
    }

    const value = measure.latestReading.value;
    const dateTime = measure.latestReading.dateTime;

    const level = `${value} m`;
    const timestamp = new Date(dateTime).toLocaleString("en-GB");

    let state = "Normal";
    if (measure.typicalRangeHigh && value > measure.typicalRangeHigh) state = "High";
    if (measure.typicalRangeLow && value < measure.typicalRangeLow) state = "Low";

    return Response.json({
      level,
      timestamp,
      trend: "Unknown",
      state
    });
  } catch (e) {
    return Response.json({
      level: "No data available",
      timestamp: "No recent reading",
      trend: "Unknown",
      state: "Unknown"
    });
  }
}
