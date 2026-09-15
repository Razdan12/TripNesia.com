import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { TravelState, Destination, ItineraryDay, RouteSegment, ChatMessage, Category } from '../types';

type Action =
  | { type: 'SET_CITY'; payload: { city: string; lat: number; lon: number } }
  | { type: 'SET_BUDGET'; payload: number }
  | { type: 'SET_DESTINATIONS'; payload: Destination[] }
  | { type: 'TOGGLE_DESTINATION'; payload: Destination }
  | { type: 'REMOVE_SELECTED'; payload: string }
  | { type: 'SET_ITINERARY'; payload: { days: ItineraryDay[]; segments: RouteSegment[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LANG'; payload: 'id' | 'en' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_FILTER'; payload: Category }
  | { type: 'CLEAR_SELECTED' };

const initialState: TravelState = {
  city: '',
  cityLat: 0,
  cityLon: 0,
  budget: 500000,
  destinations: [],
  selectedDestinations: [],
  itinerary: [],
  routeSegments: [],
  loading: false,
  error: null,
  lang: 'id',
  chatMessages: [],
  activeFilter: 'all',
};

function reducer(state: TravelState, action: Action): TravelState {
  switch (action.type) {
    case 'SET_CITY':
      return { ...state, city: action.payload.city, cityLat: action.payload.lat, cityLon: action.payload.lon };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'SET_DESTINATIONS':
      return { ...state, destinations: action.payload };
    case 'TOGGLE_DESTINATION': {
      const exists = state.selectedDestinations.find((d: Destination) => d.id === action.payload.id);
      if (exists) {
        return { ...state, selectedDestinations: state.selectedDestinations.filter((d: Destination) => d.id !== action.payload.id) };
      }
      return { ...state, selectedDestinations: [...state.selectedDestinations, action.payload] };
    }
    case 'REMOVE_SELECTED':
      return { ...state, selectedDestinations: state.selectedDestinations.filter((d: { id: string }) => d.id !== action.payload) };
    case 'SET_ITINERARY':
      return { ...state, itinerary: action.payload.days, routeSegments: action.payload.segments };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LANG':
      return { ...state, lang: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'CLEAR_SELECTED':
      return { ...state, selectedDestinations: [], itinerary: [], routeSegments: [] };
    default:
      return state;
  }
}

const TravelContext = createContext<{
  state: TravelState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TravelContext.Provider value={{ state, dispatch }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error('useTravel must be used within TravelProvider');
  return ctx;
}
