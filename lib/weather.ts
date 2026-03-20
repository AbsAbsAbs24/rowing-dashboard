export type WeatherData = {
  temperature: string;
  condition: string;
  wind: string;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

const BEDFORD_AERODROME = {
  latitude: 52.2325,
  longitude: -0.4456
};

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${BEDFORD_AERODROME.latitude}` +
  `&longitude=${BEDFORD_AERODROME.longitude}` +
  "&current=temperature_2m,weather_code,wind_speed_10m" +
  "&temperature_unit=celsius&wind_speed_unit=kmh&timezone=Europe%2FLondon";

function mapWeatherCode(code?: number) {
  switch (code) {
    case 0:
      return "Clear";
    case 1:
    case 2:
      return "Partly cloudy";
    case 3:
      return "Cloudy";
    case 45:
    case 48:
      return "Fog";
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "Drizzle";
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return "Rain";
    case 71:
    case 73:
    case 75:
    case 77:
      return "Snow";
    case 80:
    case 81:
    case 82:
      return "Rain showers";
    case 85:
    case 86:
      return "Snow showers";
    case 95:
    case 96:
    case 99:
      return "Thunderstorm";
    default:
      return "No weather data";
  }
}

function formatTemperature(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "No weather data";
  }

  return `${Math.round(value)}°C`;
}

function formatWind(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "No weather data";
  }

  return `${Math.round(value)} km/h`;
}

export async function getWeatherData(): Promise<WeatherData> {
  try {
    const response = await fetch(WEATHER_URL, {
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      console.error("Failed to fetch weather data", response.status, response.statusText);
      return {
        temperature: "No weather data",
        condition: "No weather data",
        wind: "No weather data"
      };
    }

    const payload = (await response.json()) as OpenMeteoResponse;
    const current = payload.current;

    return {
      temperature: formatTemperature(current?.temperature_2m),
      condition: mapWeatherCode(current?.weather_code),
      wind: formatWind(current?.wind_speed_10m)
    };
  } catch (error) {
    console.error("Failed to load weather data", error);
    return {
      temperature: "No weather data",
      condition: "No weather data",
      wind: "No weather data"
    };
  }
}
