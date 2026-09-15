import type { Destination, Category } from '../types';
import { CITY_COORDINATES, CURATED_DESTINATIONS } from '../data/destinationsData';

// Map OSM tourism tags to our categories
function mapCategory(tags: Record<string, string>): Category {
  const tourism = tags.tourism || '';
  const amenity = tags.amenity || '';
  const leisure = tags.leisure || '';
  const shop = tags.shop || '';
  const historic = tags.historic || '';

  if (shop || amenity === 'marketplace') return 'shopping';
  if (amenity === 'restaurant' || amenity === 'cafe' || amenity === 'food_court' || tags.cuisine) return 'culinary';
  if (historic || tourism === 'museum' || tourism === 'artwork' || amenity === 'place_of_worship') return 'culture';
  if (leisure === 'park' || leisure === 'nature_reserve' || tourism === 'viewpoint' || tourism === 'camp_site') return 'nature';
  if (tourism === 'theme_park' || leisure === 'playground' || leisure === 'zoo' || leisure === 'water_park') return 'family';
  if (leisure === 'sports_centre' || amenity === 'cinema' || amenity === 'theatre') return 'entertainment';
  if (tourism === 'attraction' || tourism === 'gallery') return 'culture';
  return 'nature';
}

// Estimate cost based on OSM tags and category
function estimateCost(tags: Record<string, string>, category: Category): number {
  if (tags.fee === 'no' || tags['access'] === 'yes') return 0;
  const feeStr = tags['charge'] || tags['fee:amount'] || '';
  if (feeStr) {
    const num = parseInt(feeStr.replace(/\D/g, ''));
    if (!isNaN(num) && num > 0) return num;
  }
  const defaults: Record<Category, number> = {
    all: 25000,
    nature: 20000,
    culture: 30000,
    culinary: 50000,
    shopping: 0,
    entertainment: 75000,
    family: 80000,
  };
  return defaults[category] || 25000;
}

function generateDescription(_tags: Record<string, string>, name: string, category: Category): string {
  const descMap: Record<Category, string[]> = {
    all: [`${name} adalah destinasi menarik yang wajib dikunjungi.`],
    nature: [
      `${name} menawarkan keindahan alam yang memukau dengan pemandangan yang menakjubkan.`,
      `Nikmati keindahan alam ${name} yang asri dan menyegarkan.`,
    ],
    culture: [
      `${name} adalah situs bersejarah yang kaya akan nilai budaya dan sejarah.`,
      `Jelajahi kekayaan budaya dan warisan sejarah di ${name}.`,
    ],
    culinary: [
      `${name} menyajikan cita rasa kuliner lokal yang autentik dan lezat.`,
      `Nikmati pengalaman kuliner tak terlupakan di ${name}.`,
    ],
    shopping: [
      `${name} adalah surga belanja dengan berbagai pilihan produk lokal dan internasional.`,
      `Temukan berbagai pilihan belanja seru di ${name}.`,
    ],
    entertainment: [
      `${name} menawarkan hiburan seru yang cocok untuk semua kalangan.`,
      `Rasakan keseruan dan hiburan terbaik di ${name}.`,
    ],
    family: [
      `${name} adalah tempat wisata keluarga yang menyenangkan untuk semua usia.`,
      `Ciptakan kenangan indah bersama keluarga di ${name}.`,
    ],
  };
  const options = descMap[category] || descMap.all;
  return options[Math.floor(Math.random() * options.length)];
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

// Find curated city key from query string or coordinates
function findCuratedCityKey(cityName: string, lat?: number, lon?: number): string | null {
  const norm = (cityName || '').trim().toLowerCase();
  for (const key of Object.keys(CURATED_DESTINATIONS)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) return key;
  }
  if (lat !== undefined && lon !== undefined) {
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      const dLat = Math.abs(coords.lat - lat);
      const dLon = Math.abs(coords.lon - lon);
      if (dLat < 0.45 && dLon < 0.45 && CURATED_DESTINATIONS[key]) {
        return key;
      }
    }
  }
  return null;
}

export async function fetchDestinations(
  lat: number,
  lon: number,
  budget: number,
  radius: number = 20000,
  cityName: string = ''
): Promise<Destination[]> {
  const cityKey = findCuratedCityKey(cityName, lat, lon);
  const curated = cityKey && CURATED_DESTINATIONS[cityKey] ? CURATED_DESTINATIONS[cityKey] : null;

  const onlineDestinations: Destination[] = [];

  // Try fetching from Overpass API using POST
  try {
    const query = `
      [out:json][timeout:10];
      (
        node["tourism"~"attraction|museum|viewpoint|theme_park|gallery|artwork"](around:${radius},${lat},${lon});
        node["historic"~"monument|castle|ruins|fort|memorial"](around:${radius},${lat},${lon});
        node["leisure"~"park|nature_reserve|zoo|water_park"](around:${radius},${lat},${lon});
        node["amenity"~"restaurant|cafe|marketplace"](around:${radius},${lat},${lon});
        way["tourism"~"attraction|museum|viewpoint|theme_park|gallery"](around:${radius},${lat},${lon});
        way["historic"~"monument|castle|ruins|fort|memorial"](around:${radius},${lat},${lon});
        way["leisure"~"park|nature_reserve|zoo"](around:${radius},${lat},${lon});
      );
      out center 40;
    `;

    // 4 second timeout controller to prevent user waiting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://overpass.kumi.systems/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const elements: OverpassElement[] = data.elements || [];
      const seen = new Set<string>();

      for (const el of elements) {
        if (!el.tags?.name) continue;
        const name = el.tags.name;
        if (seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());

        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) continue;

        const category = mapCategory(el.tags);
        const estimatedCost = estimateCost(el.tags, category);

        const tags: string[] = [];
        if (el.tags.tourism) tags.push(el.tags.tourism);
        if (el.tags.historic) tags.push(el.tags.historic);
        if (el.tags.leisure) tags.push(el.tags.leisure);
        if (el.tags.amenity) tags.push(el.tags.amenity);

        onlineDestinations.push({
          id: `${el.type}-${el.id}`,
          name,
          category,
          lat: elLat,
          lon: elLon,
          description: generateDescription(el.tags, name, category),
          estimatedCost,
          openingHours: el.tags['opening_hours'],
          rating: el.tags['stars'] ? parseFloat(el.tags['stars']) : undefined,
          tags,
          address: el.tags['addr:full'] || el.tags['addr:street'],
          website: el.tags.website || el.tags['contact:website'],
          accessible: el.tags['wheelchair'] === 'yes',
        });
      }
    }
  } catch {
    // If Overpass is blocked, returns 406, or times out, gracefully use curated data
  }

  // Combine curated + online data if available
  let combinedList: Destination[] = [];
  if (curated && curated.length > 0) {
    if (onlineDestinations.length > 0) {
      const names = new Set(curated.map((c) => c.name.toLowerCase()));
      const filteredOnline = onlineDestinations.filter((o) => !names.has(o.name.toLowerCase()));
      combinedList = [...curated, ...filteredOnline];
    } else {
      combinedList = curated;
    }
  } else if (onlineDestinations.length > 0) {
    combinedList = onlineDestinations;
  } else {
    // Default fallback to Jakarta
    combinedList = CURATED_DESTINATIONS.jakarta || [];
  }

  // Filter by user budget
  return combinedList
    .filter((d) => budget <= 0 || d.estimatedCost === 0 || d.estimatedCost <= budget)
    .slice(0, 50);
}

export async function geocodeCity(
  city: string
): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const norm = (city || '').trim().toLowerCase();

  // 1. Instant built-in dictionary lookup (0ms, 100% reliable, immune to Nominatim CORS/rate limits)
  for (const [key, info] of Object.entries(CITY_COORDINATES)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return {
        lat: info.lat,
        lon: info.lon,
        displayName: `${info.name}, ${info.province}, Indonesia`,
      };
    }
  }

  // 2. Fallback to Nominatim OSM search for smaller/unlisted towns
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Indonesia')}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'id,en' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    }
  } catch {
    // Fallback if Nominatim blocked by browser
  }

  // 3. Fail-safe default to Jakarta
  const defaultCity = CITY_COORDINATES.jakarta;
  return {
    lat: defaultCity.lat,
    lon: defaultCity.lon,
    displayName: `${city}, Indonesia`,
  };
}
