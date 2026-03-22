export type RiverLevelData = {
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
        trend?: string;
      };
      trend?: string;
      typicalRangeHigh?: number;
      typicalRangeLow?: number;
    }>;
  };
};

const RIVER_LEVEL_URL = "https://environment.data.gov.uk/flood-monitoring/id/stations/6169";

function formatRiverLevel(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "No data available";
  }

  return `${value.toFixed(2)} m`;
}

function formatTrend(trend?: string) {
  if (!trend) {
    return "Unknown";
  }

  const normalizedTrend = trend.trim().toLowerCase();

  if (normalizedTrend.includes("rise")) {
    return "Rising";
  }

  if (normalizedTrend.includes("fall")) {
    return "Falling";
  }

  if (normalizedTrend.includes("steady")) {
    return "Steady";
  }

  return "Unknown";
}

function getState(value?: number, typicalRangeLow?: number, typicalRangeHigh?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Unknown";
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

  return "Unknown";
}

function formatReadingTime(dateTime?: string) {
  if (!dateTime) {
    return "No recent reading";
  }

  const parsedDate = new Date(dateTime);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No recent reading";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsedDate);
}

export async function getRiverLevelData(): Promise<RiverLevelData> {
  try {
    const response = await fetch(RIVER_LEVEL_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch river level data", response.status);
      return {
        level: "No data available",
        timestamp: "No recent reading",
        trend: "Unknown",
        state: "Unknown"
      };
    }

    let payload: EnvironmentAgencyResponse;

    try {
      payload = (await response.json()) as EnvironmentAgencyResponse;
    } catch (error) {
      console.error("Failed to parse river level data", error);
      return {
        level: "No data available",
        timestamp: "No recent reading",
        trend: "Unknown",
        state: "Unknown"
      };
    }

    const levelMeasure = payload.items?.measures?.find((measure) => measure.parameter === "level");
    const latestReading = levelMeasure?.latestReading;

    return {
      level: formatRiverLevel(latestReading?.value),
      timestamp: formatReadingTime(latestReading?.dateTime),
      trend: formatTrend(latestReading?.trend ?? levelMeasure?.trend),
      state: getState(latestReading?.value, levelMeasure?.typicalRangeLow, levelMeasure?.typicalRangeHigh)
    };
  } catch (error) {
    console.error("Failed to load river level data", error);
    return {
      level: "No data available",
      timestamp: "No recent reading",
      trend: "Unknown",
      state: "Unknown"
    };
  }
}
