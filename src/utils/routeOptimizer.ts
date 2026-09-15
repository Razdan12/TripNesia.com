import type { Destination, ItineraryDay, RouteSegment } from '../types';

// Calculate distance between two coordinates (Haversine formula)
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nearest Neighbor TSP heuristic
function optimizeRoute(destinations: Destination[]): Destination[] {
  if (destinations.length <= 2) return destinations;
  
  const unvisited = [...destinations];
  const route: Destination[] = [unvisited.shift()!];

  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    unvisited.forEach((d, i) => {
      const dist = haversineDistance(current.lat, current.lon, d.lat, d.lon);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });

    route.push(unvisited.splice(nearestIdx, 1)[0]);
  }

  return route;
}

// Split destinations into days (max 4-5 per day based on distance)
function splitIntoDays(destinations: Destination[]): Destination[][] {
  const MAX_PER_DAY = 5;
  const MAX_DAILY_KM = 50;
  const days: Destination[][] = [];
  let currentDay: Destination[] = [];
  let dailyKm = 0;

  for (let i = 0; i < destinations.length; i++) {
    if (currentDay.length === 0) {
      currentDay.push(destinations[i]);
      continue;
    }

    const prev = currentDay[currentDay.length - 1];
    const dist = haversineDistance(prev.lat, prev.lon, destinations[i].lat, destinations[i].lon);

    if (currentDay.length >= MAX_PER_DAY || dailyKm + dist > MAX_DAILY_KM) {
      days.push(currentDay);
      currentDay = [destinations[i]];
      dailyKm = 0;
    } else {
      currentDay.push(destinations[i]);
      dailyKm += dist;
    }
  }

  if (currentDay.length > 0) days.push(currentDay);
  return days;
}

export function buildItinerary(
  selectedDestinations: Destination[]
): { days: ItineraryDay[]; segments: RouteSegment[] } {
  if (selectedDestinations.length === 0) return { days: [], segments: [] };

  const optimized = optimizeRoute([...selectedDestinations]);
  const dayGroups = splitIntoDays(optimized);

  const allSegments: RouteSegment[] = [];
  const today = new Date();

  const days: ItineraryDay[] = dayGroups.map((destinations, i) => {
    // Build segments for this day
    for (let j = 0; j < destinations.length - 1; j++) {
      const from = destinations[j];
      const to = destinations[j + 1];
      const distance = haversineDistance(from.lat, from.lon, to.lat, to.lon);
      const duration = Math.round((distance / 30) * 60); // avg 30km/h in-city
      allSegments.push({ from, to, distance: parseFloat(distance.toFixed(2)), duration });
    }

    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + i);

    const totalCost = destinations.reduce((sum, d) => sum + d.estimatedCost, 0);
    // Each place ~2h, plus travel between them (estimated from segments)
    const totalDuration = destinations.length * 120;

    return {
      day: i + 1,
      date: dayDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      destinations,
      totalCost,
      totalDuration,
    };
  });

  return { days, segments: allSegments };
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} mnt`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} mnt`;
}
