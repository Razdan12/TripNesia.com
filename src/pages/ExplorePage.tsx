import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { strings } from '../i18n';
import { fetchDestinations } from '../utils/overpassApi';
import DestinationCard from '../components/DestinationCard';
import WeatherWidget from '../components/WeatherWidget';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import type { Destination, Category } from '../types';
import { buildItinerary, formatCurrency } from '../utils/routeOptimizer';
import {
  MapPin, Map, X, AlertCircle,
  Leaf, Landmark, UtensilsCrossed, ShoppingBag, Gamepad2, Baby, LayoutGrid,
  CalendarCheck, ChevronRight, Trash2,
} from 'lucide-react';

const FILTERS: { value: Category; icon: React.ReactNode; id: string; en: string }[] = [
  { value: 'all',           icon: <LayoutGrid size={13} />,       id: 'Semua',    en: 'All' },
  { value: 'nature',        icon: <Leaf size={13} />,             id: 'Alam',     en: 'Nature' },
  { value: 'culture',       icon: <Landmark size={13} />,         id: 'Budaya',   en: 'Culture' },
  { value: 'culinary',      icon: <UtensilsCrossed size={13} />,  id: 'Kuliner',  en: 'Culinary' },
  { value: 'shopping',      icon: <ShoppingBag size={13} />,      id: 'Belanja',  en: 'Shopping' },
  { value: 'entertainment', icon: <Gamepad2 size={13} />,         id: 'Hiburan',  en: 'Entertainment' },
  { value: 'family',        icon: <Baby size={13} />,             id: 'Keluarga', en: 'Family' },
];

export default function ExplorePage() {
  const { state, dispatch } = useTravel();
  const t = strings[state.lang as 'id' | 'en'];
  const lang = state.lang as 'id' | 'en';
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);

  // Auto-fetch if needed
  useEffect(() => {
    if (state.city && state.destinations.length === 0 && !state.loading) {
      dispatch({ type: 'SET_LOADING', payload: true });
      fetchDestinations(state.cityLat, state.cityLon, state.budget, 20000, state.city)
        .then((d) => dispatch({ type: 'SET_DESTINATIONS', payload: d }))
        .catch(() => dispatch({ type: 'SET_ERROR', payload: 'Gagal memuat data destinasi.' }))
        .finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
    }
  }, [state.city]);

  const filtered: Destination[] =
    state.activeFilter === 'all'
      ? state.destinations
      : state.destinations.filter((d: Destination) => d.category === state.activeFilter);

  const totalSelectedCost = state.selectedDestinations.reduce(
    (s: number, d: Destination) => s + d.estimatedCost, 0
  );

  const handleCreateItinerary = () => {
    if (!state.selectedDestinations.length) return;
    const result = buildItinerary(state.selectedDestinations);
    dispatch({ type: 'SET_ITINERARY', payload: result });
    navigate('/itinerary');
  };

  if (!state.city) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px',
          paddingTop: 96,
          background: 'var(--bg-base)',
          gap: 32,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64, height: 64,
              background: 'var(--primary-dim)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--primary)',
            }}
          >
            <MapPin size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>
            {lang === 'id' ? 'Mulai Pencarian' : 'Start Searching'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {lang === 'id' ? 'Masukkan nama kota untuk mulai menjelajahi destinasi wisata.' : 'Enter a city name to start exploring tourist destinations.'}
          </p>
        </div>
        <SearchBar />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: 64 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* ——— Page Header ——— */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
              marginBottom: 6,
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)',
                color: 'var(--text-primary)', letterSpacing: '-0.02em',
              }}
            >
              {t.resultsFor}{' '}
              <span style={{ color: 'var(--primary)' }}>{state.city}</span>
            </h1>

            <button
              onClick={() => setShowMap((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                background: showMap ? 'var(--primary)' : 'var(--bg-surface)',
                color: showMap ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${showMap ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <Map size={14} />
              {lang === 'id' ? 'Peta' : 'Map'}
            </button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {state.loading
              ? (lang === 'id' ? 'Memuat destinasi...' : 'Loading destinations...')
              : `${filtered.length} ${lang === 'id' ? 'destinasi ditemukan' : 'destinations found'}`}
            {' · '}
            {lang === 'id' ? 'Budget' : 'Budget'}: {formatCurrency(state.budget)}
          </p>
        </div>

        {/* ——— Weather ——— */}
        {state.cityLat !== 0 && (
          <div style={{ marginBottom: 20 }}>
            <WeatherWidget lat={state.cityLat} lon={state.cityLon} cityName={state.city} />
          </div>
        )}

        {/* ——— Map ——— */}
        {showMap && state.destinations.length > 0 && (
          <div className="anim-fade-in" style={{ marginBottom: 20 }}>
            <MapView
              destinations={state.destinations.slice(0, 30)}
              centerLat={state.cityLat}
              centerLon={state.cityLon}
              height="280px"
            />
          </div>
        )}

        {/* ——— Filter chips ——— */}
        <div
          style={{
            display: 'flex', gap: 8, marginBottom: 24,
            overflowX: 'auto', paddingBottom: 4,
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => dispatch({ type: 'SET_FILTER', payload: f.value })}
              className={`chip${state.activeFilter === f.value ? ' active' : ''}`}
            >
              {f.icon}
              {f[lang]}
            </button>
          ))}
        </div>

        {/* ——— Main Content ——— */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Card Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Skeleton */}
            {state.loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 340, borderRadius: 'var(--radius-xl)' }} />
                ))}
              </div>
            )}

            {/* Error */}
            {!state.loading && state.error && (
              <div
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '80px 24px', textAlign: 'center',
                }}
              >
                <AlertCircle size={40} style={{ color: 'var(--accent)', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-secondary)' }}>{state.error}</p>
              </div>
            )}

            {/* Empty */}
            {!state.loading && !state.error && filtered.length === 0 && (
              <div
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '80px 24px', textAlign: 'center',
                }}
              >
                <MapPin size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{t.noResults}</p>
              </div>
            )}

            {/* Grid */}
            {!state.loading && filtered.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filtered.map((dest, i) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    animDelay={Math.min(i * 0.04, 0.4)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ——— Sidebar ——— */}
          <aside
            style={{
              width: 288, flexShrink: 0,
              position: 'sticky', top: 80,
              display: 'none', // hidden on mobile, shown via media query workaround below
            }}
            className="lg-sidebar"
          >
            <SidebarPanel
              selected={state.selectedDestinations}
              totalCost={totalSelectedCost}
              onRemove={(id) => dispatch({ type: 'REMOVE_SELECTED', payload: id })}
              onCreateItinerary={handleCreateItinerary}
              lang={lang}
              t={t}
            />
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {state.selectedDestinations.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 65, left: 16, right: 16,
            zIndex: 40,
          }}
          className="md:hidden"
        >
          <button
            onClick={handleCreateItinerary}
            style={{
              width: '100%', padding: '14px 24px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none', borderRadius: 'var(--radius-xl)',
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <CalendarCheck size={18} />
            {t.createItinerary} ({state.selectedDestinations.length})
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Desktop sidebar inline (visible for md+) */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: block !important; }
        }
      `}</style>
    </div>
  );
}

/* ——— Sidebar Panel ——— */
interface SidebarProps {
  selected: Destination[];
  totalCost: number;
  onRemove: (id: string) => void;
  onCreateItinerary: () => void;
  lang: 'id' | 'en';
  t: Record<string, string>;
}

function SidebarPanel({ selected, totalCost, onRemove, onCreateItinerary, lang, t }: SidebarProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 15,
            color: 'var(--text-primary)',
          }}
        >
          {t.selectedPlaces}
        </h3>
        {selected.length > 0 && (
          <span
            style={{
              minWidth: 22, height: 22, padding: '0 6px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {selected.length}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        {selected.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <MapPin size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {lang === 'id'
                ? 'Klik kartu destinasi untuk menambahkannya ke rencana tripmu.'
                : 'Click a destination card to add it to your trip plan.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selected.map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--primary)', flexShrink: 0,
                  }}
                />
                <span
                  className="line-clamp-1"
                  style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}
                >
                  {d.name}
                </span>
                <button
                  onClick={() => onRemove(d.id)}
                  style={{
                    padding: 4,
                    color: 'var(--text-muted)',
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'color var(--transition)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--danger)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {selected.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {lang === 'id' ? 'Est. Biaya Total' : 'Est. Total Cost'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
              {formatCurrency(totalCost)}
            </span>
          </div>
          <button
            id="create-itinerary-btn"
            onClick={onCreateItinerary}
            style={{
              width: '100%', padding: '11px 20px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-accent)',
              transition: 'all var(--transition)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.transform = 'none';
            }}
          >
            <CalendarCheck size={15} />
            {t.createItinerary}
          </button>

          {/* Clear all */}
          <button
            onClick={() => selected.forEach((d) => onRemove(d.id))}
            style={{
              width: '100%', marginTop: 8, padding: '8px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              transition: 'color var(--transition)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--danger)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
          >
            <Trash2 size={12} />
            {lang === 'id' ? 'Hapus semua' : 'Clear all'}
          </button>
        </div>
      )}
    </div>
  );
}
