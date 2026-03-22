export type RiverLevelData = {
  level: string;
  timestamp: string;
};

type EnvironmentAgencyResponse = {
  items?: Array<{
    value?: number;
    dateTime?: string;
  }>;
};

const RIVER_LEVEL_URL =
  "https://environment.data.gov.uk/flood-monitoring/id/stations/6169/readings?_sorted&limit=1";

function formatRiverLevel(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "No data available";
  }

  return `${value.toFixed(2)} m`;
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
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      console.error("Failed to fetch river level data", response.status, response.statusText);
      return {
        level: "No data available",
        timestamp: "No recent reading"
      };
    }

    const payload = (await response.json()) as EnvironmentAgencyResponse;
    const latestReading = payload.items?.[0];

    return {
      level: formatRiverLevel(latestReading?.value),
      timestamp: formatReadingTime(latestReading?.dateTime)
    };
  } catch (error) {
    console.error("Failed to load river level data", error);
    return {
      level: "No data available",
      timestamp: "No recent reading"
    };
  }
}
