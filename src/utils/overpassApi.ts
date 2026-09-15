import type { Destination, Category } from '../types';

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
  // Default estimates by category (IDR)
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

export async function fetchDestinations(
  lat: number,
  lon: number,
  budget: number,
  radius: number = 20000
): Promise<Destination[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|theme_park|gallery|artwork"](around:${radius},${lat},${lon});
      node["historic"~"monument|castle|ruins|fort|memorial"](around:${radius},${lat},${lon});
      node["leisure"~"park|nature_reserve|zoo|water_park"](around:${radius},${lat},${lon});
      node["amenity"~"restaurant|cafe|marketplace"](around:${radius},${lat},${lon});
      way["tourism"~"attraction|museum|viewpoint|theme_park|gallery"](around:${radius},${lat},${lon});
      way["historic"~"monument|castle|ruins|fort|memorial"](around:${radius},${lat},${lon});
      way["leisure"~"park|nature_reserve|zoo"](around:${radius},${lat},${lon});
    );
    out center 60;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch destinations');

  const data = await response.json();
  const elements: OverpassElement[] = data.elements || [];

  const seen = new Set<string>();
  const destinations: Destination[] = [];

  for (const el of elements) {
    if (!el.tags?.name) continue;
    const name = el.tags.name;
    if (seen.has(name)) continue;
    seen.add(name);

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;

    const category = mapCategory(el.tags);
    const estimatedCost = estimateCost(el.tags, category);
    if (estimatedCost > budget && estimatedCost > 0) continue;

    const tags: string[] = [];
    if (el.tags.tourism) tags.push(el.tags.tourism);
    if (el.tags.historic) tags.push(el.tags.historic);
    if (el.tags.leisure) tags.push(el.tags.leisure);
    if (el.tags.amenity) tags.push(el.tags.amenity);

    destinations.push({
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

  return destinations.slice(0, 50);
}

export async function geocodeCity(city: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Indonesia')}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: { 'Accept-Language': 'id,en' }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
