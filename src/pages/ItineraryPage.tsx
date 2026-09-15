import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { strings } from '../i18n';
import type { ItineraryDay } from '../types';
import { formatCurrency, formatDuration } from '../utils/routeOptimizer';
import { exportItineraryPDF, previewItineraryPDF } from '../utils/pdfExport';
import MapView from '../components/MapView';
import Timeline from '../components/Timeline';
import { ArrowLeft, Download, Share2, MapPin, DollarSign, Clock, Map, CalendarDays, Eye } from 'lucide-react';

export default function ItineraryPage() {
  const { state, dispatch } = useTravel();
  const t = strings[state.lang as 'id' | 'en'];
  const lang = state.lang as 'id' | 'en';
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalCost     = state.itinerary.reduce((s: number, d: ItineraryDay) => s + d.totalCost, 0);
  const totalDuration = state.itinerary.reduce((s: number, d: ItineraryDay) => s + d.totalDuration, 0);
  const allDestinations = state.itinerary.flatMap((d: ItineraryDay) => d.destinations);

  if (state.itinerary.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, paddingTop: 96, textAlign: 'center',
          background: 'var(--bg-base)',
        }}
      >
        <div
          style={{
            width: 64, height: 64,
            background: 'var(--primary-dim)', border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)', margin: '0 auto 20px',
          }}
        >
          <CalendarDays size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>
          {lang === 'id' ? 'Belum ada itinerary' : 'No itinerary yet'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>
          {lang === 'id' ? 'Pilih destinasi terlebih dahulu untuk membuat itinerary.' : 'Select destinations first to create an itinerary.'}
        </p>
        <button
          onClick={() => navigate('/explore')}
          style={{
            padding: '11px 24px',
            background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: 'var(--shadow-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {lang === 'id' ? 'Jelajahi Destinasi' : 'Explore Destinations'}
        </button>
      </div>
    );
  }

  const handleExportPDF = async () => {
    setExporting(true);
    try { await exportItineraryPDF(state.city, state.itinerary, state.budget); }
    finally { setExporting(false); }
  };

  const handlePreviewPDF = async () => {
    setPreviewing(true);
    try { await previewItineraryPDF(state.city, state.itinerary, state.budget); }
    finally { setPreviewing(false); }
  };

  const handleShare = async () => {
    const text = `🗺️ Itinerary TripNesia — ${state.city}\n${state.itinerary.length} hari · ${state.selectedDestinations.length} destinasi · Est. ${formatCurrency(totalCost)}\n\nDibuat dengan TripNesia`;
    if (navigator.share) { try { await navigator.share({ title: 'TripNesia', text }); } catch {} }
    else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stats = [
    { icon: <MapPin size={16} />,      value: state.selectedDestinations.length, label: lang === 'id' ? 'Destinasi' : 'Destinations', color: 'var(--primary)' },
    { icon: <CalendarDays size={16} />, value: `${state.itinerary.length} ${t.day}`, label: lang === 'id' ? 'Perjalanan' : 'Trip',  color: 'var(--accent)' },
    { icon: <Clock size={16} />,        value: formatDuration(totalDuration),     label: lang === 'id' ? 'Durasi' : 'Duration',        color: 'var(--success)' },
    { icon: <DollarSign size={16} />,   value: formatCurrency(totalCost),         label: t.totalCost,                                   color: '#F59E0B' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: 64 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ——— Page Header ——— */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 20, marginBottom: 32,
          }}
        >
          <div>
            <button
              onClick={() => navigate('/explore')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--text-secondary)',
                background: 'none', border: 'none', cursor: 'pointer',
                marginBottom: 8, padding: '4px 0', fontFamily: 'var(--font-sans)',
                transition: 'color var(--transition)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              <ArrowLeft size={14} /> {t.backToExplore}
            </button>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)',
                color: 'var(--text-primary)', letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              {t.itineraryTitle}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} /> {state.city}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button
              onClick={handleShare}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px',
                background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              <Share2 size={15} />
              {copied ? (lang === 'id' ? '✓ Tersalin' : '✓ Copied') : t.shareLink}
            </button>

            <button
              id="preview-pdf-btn"
              onClick={handlePreviewPDF}
              disabled={previewing}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 16px',
                background: 'var(--bg-surface)', color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 600,
                cursor: previewing ? 'not-allowed' : 'pointer',
                opacity: previewing ? 0.7 : 1,
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                if (!previewing) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
              }}
            >
              <Eye size={15} color="var(--primary)" />
              {previewing ? (lang === 'id' ? 'Membuka...' : 'Opening...') : (lang === 'id' ? 'Lihat PDF' : 'Preview PDF')}
            </button>

            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px',
                background: 'var(--primary)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 600,
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.7 : 1,
                boxShadow: 'var(--shadow-primary)',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) => {
                if (!exporting) (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--primary)';
              }}
            >
              {exporting ? (
                <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              ) : <Download size={15} />}
              {exporting ? 'Exporting...' : t.exportPDF}
            </button>
          </div>
        </div>

        {/* ——— Stats Row ——— */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16, marginBottom: 32,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: s.color, marginBottom: 8,
                }}
              >
                {s.icon}
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {s.label}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800, fontSize: 20,
                  color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.01em',
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ——— Main Grid ——— */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* Top: Map */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 15,
                  color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Map size={16} style={{ color: 'var(--primary)' }} />
                {lang === 'id' ? 'Peta Rute' : 'Route Map'}
              </h2>
              <button
                onClick={() => setShowMap((v) => !v)}
                style={{
                  fontSize: 13, color: 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {showMap ? (lang === 'id' ? 'Sembunyikan' : 'Hide') : (lang === 'id' ? 'Tampilkan' : 'Show')}
              </button>
            </div>
            {showMap && allDestinations.length > 0 && (
              <div style={{ padding: 16 }}>
                <MapView
                  destinations={allDestinations}
                  segments={state.routeSegments}
                  centerLat={state.cityLat}
                  centerLon={state.cityLon}
                  height="380px"
                  showRoute={true}
                />
              </div>
            )}
          </div>

          {/* Bottom: Timeline */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 15,
                color: 'var(--text-primary)',
                marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <CalendarDays size={16} style={{ color: 'var(--primary)' }} />
              Timeline
            </h2>
            <Timeline days={state.itinerary} segments={state.routeSegments} />
          </div>
        </div>

        {/* Reset */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={() => { dispatch({ type: 'CLEAR_SELECTED' }); navigate('/explore'); }}
            style={{
              padding: '10px 24px',
              background: 'var(--bg-surface)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              fontSize: 14, cursor: 'pointer',
              transition: 'all var(--transition)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            🔄 {lang === 'id' ? 'Rencanakan Ulang' : 'Plan Again'}
          </button>
        </div>
      </div>
    </div>
  );
}
