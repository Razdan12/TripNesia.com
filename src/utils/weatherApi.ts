import type { WeatherData } from '../types';

const WMO_CODES: Record<number, string> = {
  0: 'Cerah / Clear sky',
  1: 'Sebagian cerah / Mainly clear',
  2: 'Berawan sebagian / Partly cloudy',
  3: 'Mendung / Overcast',
  45: 'Berkabut / Foggy',
  48: 'Berkabut beku / Icing fog',
  51: 'Gerimis / Light drizzle',
  53: 'Gerimis / Moderate drizzle',
  55: 'Gerimis lebat / Dense drizzle',
  61: 'Hujan ringan / Light rain',
  63: 'Hujan sedang / Moderate rain',
  65: 'Hujan lebat / Heavy rain',
  80: 'Hujan lokal / Local showers',
  81: 'Hujan lokal sedang / Moderate showers',
  82: 'Hujan lokal lebat / Heavy showers',
  95: 'Petir / Thunderstorm',
  96: 'Petir + es / Thunderstorm with hail',
  99: 'Petir + es lebat / Heavy thunderstorm with hail',
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Jakarta`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const c = data.current;
    return {
      temperature: Math.round(c.temperature_2m),
      weatherCode: c.weather_code,
      humidity: c.relative_humidity_2m,
      windspeed: Math.round(c.wind_speed_10m),
      description: WMO_CODES[c.weather_code] || 'Tidak diketahui',
    };
  } catch {
    return null;
  }
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 82) return '⛈️';
  return '⛈️';
}
