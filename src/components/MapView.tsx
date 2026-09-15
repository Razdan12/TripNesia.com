import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Destination, RouteSegment } from '../types';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Props {
  destinations: Destination[];
  segments?: RouteSegment[];
  centerLat: number;
  centerLon: number;
  height?: string;
  showRoute?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  nature: '#10B981',
  culture: '#8B5CF6',
  culinary: '#F59E0B',
  shopping: '#EC4899',
  entertainment: '#EF4444',
  family: '#3B82F6',
  all: '#00B4D8',
};

function createCustomIcon(category: string, index?: number) {
  const color = CATEGORY_COLORS[category] || '#00B4D8';
  const label = index !== undefined ? `${index + 1}` : '';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 11px;">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

export default function MapView({ destinations, segments, centerLat, centerLon, height = '400px', showRoute = false }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [centerLat, centerLon],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylineRef.current?.remove();

    if (destinations.length === 0) return;

    // Add markers
    destinations.forEach((dest, i) => {
      const icon = showRoute ? createCustomIcon(dest.category, i) : createCustomIcon(dest.category);
      const marker = L.marker([dest.lat, dest.lon], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="font-family: var(--font-primary, system-ui, sans-serif); min-width: 180px; padding: 2px;">
            <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #0f172a; font-size: 13px;">${dest.name}</h4>
            <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">${dest.description.slice(0, 90)}...</p>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 999px;">
                ${dest.estimatedCost === 0 ? 'Gratis' : `Rp ${dest.estimatedCost.toLocaleString('id-ID')}`}
              </span>
              <span style="font-size: 10px; color: #64748b; text-transform: capitalize;">
                ${dest.category}
              </span>
            </div>
          </div>
        `);
      markersRef.current.push(marker);
    });

    // Draw route polyline
    if (showRoute && segments && segments.length > 0) {
      const latlngs: [number, number][] = segments.map((s) => [s.from.lat, s.from.lon]);
      if (segments.length > 0) {
        latlngs.push([segments[segments.length - 1].to.lat, segments[segments.length - 1].to.lon]);
      }
      polylineRef.current = L.polyline(latlngs, {
        color: '#00B4D8',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 6',
      }).addTo(mapRef.current);
    }

    // Fit bounds
    const bounds = L.latLngBounds(destinations.map((d) => [d.lat, d.lon]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [destinations, segments, showRoute]);

  return (
    <div
      ref={containerRef}
      style={{ height, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}
    />
  );
}
