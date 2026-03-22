import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RiverLevelData = {
  level: string;
  timestamp: string;
  trend: string;
  state: string;
};

type EnvironmentAgencyResponse = {
  items?: {
    measures?: Array<{
      parameter?: string;
      latestReading?: {
        value?: number;
        dateTime?: string;
      };
      typicalRangeHigh?: number;
      typicalRangeLow?: number;
    }>;
  };
};

const ENVIRONMENT_AGENCY_URL = "https://environment.data.gov.uk/flood-monitoring/id/stations/6169";

const FALLBACK_DATA: RiverLevelData = {
  level: "No data available",
  timestamp: "No recent reading",
  trend: "Unknown",
  state: "Unknown"
};

function formatRiverLevel(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return FALLBACK_DATA.level;
  }

  return `${value.toFixed(2)} m`;
}

function formatReadingTime(dateTime?: string) {
  if (!dateTime) {
    return FALLBACK_DATA.timestamp;
  }

  const parsedDate = new Date(dateTime);

  if (Number.isNaN(parsedDate.getTime())) {
    return FALLBACK_DATA.timestamp;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsedDate);
}

function getState(value?: number, typicalRangeLow?: number, typicalRangeHigh?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return FALLBACK_DATA.state;
  }

  if (typeof typicalRangeLow === "number" && !Number.isNaN(typicalRangeLow) && value < typicalRangeLow) {
    return "Low";
  }

  if (typeof typicalRangeHigh === "number" && !Number.isNaN(typicalRangeHigh) && value > typicalRangeHigh) {
    return "High";
  }

  if (
    typeof typicalRangeLow === "number" &&
    !Number.isNaN(typicalRangeLow) &&
    typeof typicalRangeHigh === "number" &&
    !Number.isNaN(typicalRangeHigh)
  ) {
    return "Normal";
  }

  return FALLBACK_DATA.state;
}

export async function GET() {
  try {
    const response = await fetch(ENVIRONMENT_AGENCY_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch river data", response.status);
      return NextResponse.json(FALLBACK_DATA);
    }

    let payload: EnvironmentAgencyResponse;

    try {
      payload = (await response.json()) as EnvironmentAgencyResponse;
    } catch (error) {
      console.error("Failed to parse river data", error);
      return NextResponse.json(FALLBACK_DATA);
    }

    const levelMeasure = payload.items?.measures?.find((measure) => measure.parameter === "level");
    const latestReading = levelMeasure?.latestReading;

    return NextResponse.json({
      level: formatRiverLevel(latestReading?.value),
      timestamp: formatReadingTime(latestReading?.dateTime),
      trend: "Unknown",
      state: getState(latestReading?.value, levelMeasure?.typicalRangeLow, levelMeasure?.typicalRangeHigh)
    } satisfies RiverLevelData);
  } catch (error) {
    console.error("Failed to load river data", error);
    return NextResponse.json(FALLBACK_DATA);
  }
}
