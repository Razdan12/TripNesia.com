import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { useTravel } from '../context/TravelContext';
import { strings } from '../i18n';
import { ArrowRight, MapPin, Wallet, CalendarCheck, Star, TrendingUp } from 'lucide-react';

const TRENDING = [
  { id: 't1', name: 'Raja Ampat', location: 'Papua Barat', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=700&q=80', rating: 4.9, category: 'Alam', size: 'tall' },
  { id: 't2', name: 'Borobudur', location: 'Jawa Tengah', image: 'https://images.unsplash.com/photo-1580555543574-a694dcb9a3e2?w=700&q=80', rating: 4.8, category: 'Budaya', size: 'normal' },
  { id: 't3', name: 'Gunung Bromo', location: 'Jawa Timur', image: 'https://images.unsplash.com/photo-1570520847364-b6ce02b7e0ca?w=700&q=80', rating: 4.7, category: 'Alam', size: 'normal' },
  { id: 't4', name: 'Labuan Bajo', location: 'NTT', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=700&q=80', rating: 4.8, category: 'Alam', size: 'tall' },
  { id: 't5', name: 'Tanah Lot', location: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80', rating: 4.7, category: 'Budaya', size: 'normal' },
  { id: 't6', name: 'Prambanan', location: 'Yogyakarta', image: 'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?w=700&q=80', rating: 4.6, category: 'Budaya', size: 'normal' },
];

const STEPS = [
  {
    num: '01',
    icon: <Wallet size={22} />,
    color: '#0EA5E9',
    title_id: 'Masukkan Kota & Budget',
    title_en: 'Enter City & Budget',
    desc_id: 'Pilih kota tujuan dan atur anggaran perjalananmu. Engine kami akan menyesuaikan rekomendasi.',
    desc_en: 'Choose your destination city and set your travel budget. Our engine tailors recommendations accordingly.',
  },
  {
    num: '02',
    icon: <MapPin size={22} />,
    color: '#F97316',
    title_id: 'Pilih Destinasi',
    title_en: 'Choose Destinations',
    desc_id: 'Jelajahi daftar destinasi wisata dan tandai tempat yang ingin dikunjungi.',
    desc_en: 'Browse the destination list and mark the places you want to visit.',
  },
  {
    num: '03',
    icon: <CalendarCheck size={22} />,
    color: '#10B981',
    title_id: 'Dapatkan Itinerary',
    title_en: 'Get Your Itinerary',
    desc_id: 'Kami otomatis membuatkan timeline, urutan rute optimal, dan estimasi biaya perjalananmu.',
    desc_en: 'We automatically generate a timeline, optimized route order, and travel cost estimation.',
  },
];

export default function LandingPage() {
  const { state } = useTravel();
  const t = strings[state.lang as 'id' | 'en'];
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* =================== HERO =================== */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          paddingTop: 64,
        }}
      >
        {/* Background */}
        <div
          ref={parallaxRef}
          style={{
            position: 'absolute',
            inset: '-20% 0 0 0',
            backgroundImage: 'url(https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.25) saturate(1.2)',
            willChange: 'transform',
          }}
        />

        {/* Gradient overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 60% 30%, rgba(14,165,233,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(5,11,24,0) 0%, rgba(5,11,24,0.5) 70%, var(--bg-base) 100%)',
          }}
        />

        {/* Floating Orbs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)',
          top: '15%', right: '10%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
          bottom: '20%', left: '5%', pointerEvents: 'none',
        }} />

        {/* Content */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            textAlign: 'center',
            padding: '0 24px',
            maxWidth: 820,
            width: '100%',
          }}
        >
          {/* Pill badge */}
          <div
            className="anim-fade-up"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px',
              background: 'var(--primary-dim)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: 28,
              letterSpacing: '0.01em',
            }}
          >
            <span style={{ fontSize: 15 }}>🇮🇩</span>
            {state.lang === 'id' ? 'Jelajahi Keindahan Nusantara' : 'Discover the Beauty of Indonesia'}
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up delay-1 text-display"
            style={{
              fontSize: 'clamp(40px, 7vw, 72px)',
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}
          >
            {t.heroTitle}{' '}
            <span className="gradient-text">{t.heroTitleHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p
            className="anim-fade-up delay-2"
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              maxWidth: 560,
              margin: '0 auto 36px',
            }}
          >
            {t.heroSubtitle}
          </p>

          {/* Stats */}
          <div
            className="anim-fade-up delay-3"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              marginBottom: 40,
            }}
          >
            {[
              { value: '10K+', label: state.lang === 'id' ? 'Destinasi' : 'Destinations' },
              { value: '500+', label: state.lang === 'id' ? 'Kota' : 'Cities' },
              { value: '50K+', label: state.lang === 'id' ? 'Pengguna' : 'Travelers' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div
                  className="gradient-text"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="anim-fade-up delay-4">
            <SearchBar />
          </div>
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            color: 'var(--text-muted)', fontSize: 12,
          }}
        >
          <div
            style={{
              width: 1, height: 48,
              background: 'linear-gradient(to bottom, transparent, var(--primary))',
            }}
          />
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section style={{ padding: '96px 0', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              {state.lang === 'id' ? 'Cara Kerja' : 'How It Works'}
            </div>
            <h2
              className="text-heading"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--text-primary)' }}
            >
              {state.lang === 'id'
                ? 'Rencanakan Perjalananmu dalam 3 Langkah'
                : 'Plan Your Trip in 3 Simple Steps'}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="anim-fade-up"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: 32,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = step.color + '44';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {/* Number */}
                <div
                  style={{
                    position: 'absolute', top: 24, right: 24,
                    fontFamily: 'var(--font-display)',
                    fontSize: 56, fontWeight: 900,
                    color: step.color,
                    opacity: 0.08,
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {step.num}
                </div>

                {/* Icon */}
                <div
                  style={{
                    width: 52, height: 52,
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}30`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.color,
                    marginBottom: 20,
                  }}
                >
                  {step.icon}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 18,
                    color: 'var(--text-primary)',
                    marginBottom: 10,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {state.lang === 'id' ? step.title_id : step.title_en}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {state.lang === 'id' ? step.desc_id : step.desc_en}
                </p>

                {/* Bottom accent */}
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 2,
                    background: `linear-gradient(to right, transparent, ${step.color}60, transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TRENDING =================== */}
      <section style={{ padding: '0 0 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {/* Section header */}
          <div
            style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              marginBottom: 36,
            }}
          >
            <div>
              <div className="section-label">
                <TrendingUp size={12} />
                {state.lang === 'id' ? 'Trending' : 'Trending'}
              </div>
              <h2
                className="text-heading"
                style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', color: 'var(--text-primary)' }}
              >
                {t.trending}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
                {t.trendingDesc}
              </p>
            </div>
            <Link
              to="/explore"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, fontWeight: 600,
                color: 'var(--primary)',
                padding: '8px 16px',
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              {state.lang === 'id' ? 'Lihat semua' : 'See all'}
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mosaic grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'auto auto',
              gap: 16,
            }}
          >
            {TRENDING.map((dest, i) => {
              const isTall = dest.size === 'tall';
              return (
                <div
                  key={dest.id}
                  className="anim-fade-up"
                  style={{
                    animationDelay: `${i * 0.07}s`,
                    position: 'relative',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    gridRow: isTall ? 'span 2' : 'span 1',
                    height: isTall ? '100%' : 200,
                    minHeight: isTall ? 420 : 200,
                  }}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform var(--transition-slow)',
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1)')}
                  />
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(5,11,24,0.9) 0%, transparent 55%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px',
                          background: 'rgba(14,165,233,0.8)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 'var(--radius-full)',
                          color: 'white',
                        }}
                      >
                        {dest.category}
                      </span>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 3,
                          color: '#FCD34D',
                        }}
                      >
                        <Star size={10} style={{ fill: '#FCD34D' }} />
                        {dest.rating}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700, fontSize: isTall ? 20 : 16,
                        color: 'white',
                        letterSpacing: '-0.01em',
                        marginBottom: 2,
                      }}
                    >
                      {dest.name}
                    </h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} /> {dest.location}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section style={{ padding: '0 24px 96px' }}>
        <div
          style={{
            maxWidth: 760, margin: '0 auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-2xl)',
            padding: '56px 48px',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center 0%, rgba(14,165,233,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="anim-float" style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
          <h2
            className="text-heading"
            style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 12 }}
          >
            {state.lang === 'id' ? 'Siap Memulai Petualangan?' : 'Ready to Start Your Adventure?'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
            {state.lang === 'id'
              ? 'Buat itinerary perjalananmu dalam hitungan detik — gratis, tanpa daftar.'
              : 'Create your travel itinerary in seconds — free, no sign-up required.'}
          </p>
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-primary)',
              transition: 'all var(--transition)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {state.lang === 'id' ? 'Mulai Sekarang' : 'Get Started'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        <p>© 2024 TripNesia · Built for Wisatawan Indonesia 🇮🇩</p>
      </footer>
    </div>
  );
}
