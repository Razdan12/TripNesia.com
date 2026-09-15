import { useEffect, useState } from 'react';
import { fetchWeather, getWeatherIcon } from '../utils/weatherApi';
import type { WeatherData } from '../types';
import { useTravel } from '../context/TravelContext';
import { Thermometer, Droplets, Wind } from 'lucide-react';

interface Props { lat: number; lon: number; cityName: string; }

export default function WeatherWidget({ lat, lon, cityName }: Props) {
  const { state } = useTravel();
  const lang = state.lang as 'id' | 'en';
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWeather(lat, lon).then((w) => { setWeather(w); setLoading(false); });
  }, [lat, lon]);

  if (loading) {
    return <div className="skeleton" style={{ height: 76, borderRadius: 'var(--radius-xl)' }} />;
  }
  if (!weather) return null;

  const desc = lang === 'id'
    ? weather.description.split('/')[0].trim()
    : (weather.description.split('/')[1]?.trim() || weather.description);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <div style={{ fontSize: 36, lineHeight: 1 }}>{getWeatherIcon(weather.weatherCode)}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>
          {lang === 'id' ? 'Cuaca di' : 'Weather in'} {cityName}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {desc}
        </p>
      </div>

      <div
        style={{
          display: 'flex', gap: 16, flexShrink: 0,
          padding: '8px 16px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        {[
          { icon: <Thermometer size={12} style={{ color: 'var(--accent)' }} />, value: `${weather.temperature}°C` },
          { icon: <Droplets size={12} style={{ color: 'var(--primary)' }} />, value: `${weather.humidity}%` },
          { icon: <Wind size={12} style={{ color: 'var(--text-muted)' }} />, value: `${weather.windspeed}km/h` },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {item.icon} {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}
