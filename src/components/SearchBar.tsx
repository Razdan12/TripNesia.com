import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { strings } from '../i18n';
import { geocodeCity, fetchDestinations } from '../utils/overpassApi';
import { Search, MapPin, Wallet, ArrowRight } from 'lucide-react';

const BUDGET_PRESETS = [
  { label: '< 100K', value: 100000 },
  { label: '250K', value: 250000 },
  { label: '500K', value: 500000 },
  { label: '1 Jt', value: 1000000 },
  { label: '2 Jt+', value: 2000000 },
];

export default function SearchBar() {
  const { state, dispatch } = useTravel();
  const t = strings[state.lang as 'id' | 'en'];
  const navigate = useNavigate();
  const [cityInput, setCityInput] = useState(state.city);
  const [budget, setBudget] = useState(state.budget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatBudget = (v: number) => {
    if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1)}jt`;
    if (v >= 1000) return `Rp ${(v / 1000).toFixed(0)}rb`;
    return `Rp ${v}`;
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setLoading(true);
    setError('');

    try {
      const geo = await geocodeCity(cityInput.trim());
      if (!geo) {
        setError(
          state.lang === 'id'
            ? 'Kota tidak ditemukan. Coba nama lain.'
            : 'City not found. Try another name.'
        );
        return;
      }

      dispatch({ type: 'SET_CITY', payload: { city: cityInput.trim(), lat: geo.lat, lon: geo.lon } });
      dispatch({ type: 'SET_BUDGET', payload: budget });
      dispatch({ type: 'CLEAR_SELECTED' });
      dispatch({ type: 'SET_LOADING', payload: true });
      const destinations = await fetchDestinations(geo.lat, geo.lon, budget, 20000, cityInput.trim());
      dispatch({ type: 'SET_DESTINATIONS', payload: destinations });
      navigate('/explore');
    } catch {
      setError(state.lang === 'id' ? 'Terjadi kesalahan. Coba lagi.' : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-2xl)',
          padding: 24,
          boxShadow: '0 0 60px rgba(14,165,233,0.08)',
        }}
      >
        {/* City Input */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="city-input"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {state.lang === 'id' ? 'Kota Tujuan' : 'Destination City'}
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--primary)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="city-input"
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder={t.searchCity}
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color var(--transition), box-shadow var(--transition)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-dim)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <Wallet size={12} />
              {t.budgetLabel}
            </label>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {formatBudget(budget)}
            </span>
          </div>

          <input
            type="range"
            min={50000}
            max={5000000}
            step={50000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ marginBottom: 12 }}
          />

          {/* Presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setBudget(p.value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 500,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  ...(budget === p.value
                    ? {
                        background: 'var(--primary)',
                        color: 'white',
                        borderColor: 'var(--primary)',
                      }
                    : {
                        background: 'var(--bg-overlay)',
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border)',
                      }),
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-md)',
              color: '#F87171',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="search-btn"
          type="submit"
          disabled={loading || !cityInput.trim()}
          style={{
            width: '100%',
            padding: '13px 24px',
            background: loading || !cityInput.trim()
              ? 'var(--bg-overlay)'
              : 'var(--primary)',
            color: loading || !cityInput.trim() ? 'var(--text-muted)' : 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading || !cityInput.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all var(--transition)',
            boxShadow: loading || !cityInput.trim() ? 'none' : 'var(--shadow-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }}
              />
              {state.lang === 'id' ? 'Mencari...' : 'Searching...'}
            </>
          ) : (
            <>
              <Search size={16} />
              {t.searchBtn}
              <ArrowRight size={15} style={{ marginLeft: 2 }} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
