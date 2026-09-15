export interface Destination {
  id: string;
  name: string;
  category: Category;
  lat: number;
  lon: number;
  description: string;
  estimatedCost: number; // IDR
  openingHours?: string;
  rating?: number;
  imageUrl?: string;
  tags: string[];
  address?: string;
  website?: string;
  accessible?: boolean; // wheelchair/family friendly
}

export type Category =
  | 'nature'
  | 'culture'
  | 'culinary'
  | 'shopping'
  | 'entertainment'
  | 'family'
  | 'all';

export interface ItineraryDay {
  day: number;
  date?: string;
  destinations: Destination[];
  totalCost: number;
  totalDuration: number; // minutes
}

export interface RouteSegment {
  from: Destination;
  to: Destination;
  distance: number; // km
  duration: number; // minutes
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windspeed: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TravelState {
  city: string;
  cityLat: number;
  cityLon: number;
  budget: number;
  destinations: Destination[];
  selectedDestinations: Destination[];
  itinerary: ItineraryDay[];
  routeSegments: RouteSegment[];
  loading: boolean;
  error: string | null;
  lang: 'id' | 'en';
  chatMessages: ChatMessage[];
  activeFilter: Category;
}
