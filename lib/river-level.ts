import { headers } from "next/headers";

export type RiverLevelData = {
  level: string;
  timestamp: string;
  trend: string;
  state: string;
};

const RIVER_LEVEL_PATH = "/api/river";

const FALLBACK_DATA: RiverLevelData = {
  level: "No data available",
  timestamp: "No recent reading",
  trend: "Unknown",
  state: "Unknown"
};

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

export async function getRiverLevelData(): Promise<RiverLevelData> {
  try {
    const response = await fetch(new URL(RIVER_LEVEL_PATH, await getBaseUrl()), {
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("Failed to fetch river level data", response.status);
      return FALLBACK_DATA;
    }

    let payload: RiverLevelData;

    try {
      payload = (await response.json()) as RiverLevelData;
    } catch (error) {
      console.error("Failed to parse river level data", error);
      return FALLBACK_DATA;
    }

    return {
      level: payload.level || FALLBACK_DATA.level,
      timestamp: payload.timestamp || FALLBACK_DATA.timestamp,
      trend: payload.trend || FALLBACK_DATA.trend,
      state: payload.state || FALLBACK_DATA.state
    };
  } catch (error) {
    console.error("Failed to load river level data", error);
    return FALLBACK_DATA;
  }
}
