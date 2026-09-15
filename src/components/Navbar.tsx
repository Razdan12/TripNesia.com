import { Link, useLocation } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { strings } from '../i18n';
import { Globe, Map, Compass, Bot, Home, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { state, dispatch } = useTravel();
  const t = strings[state.lang as 'id' | 'en'];
  const location = useLocation();

  const navLinks = [
    { path: '/', label: t.navHome, icon: <Home size={15} /> },
    { path: '/explore', label: t.navExplore, icon: <Compass size={15} /> },
    { path: '/itinerary', label: t.navItinerary, icon: <Map size={15} /> },
    { path: '/assistant', label: t.navAssistant, icon: <Bot size={15} /> },
  ];

  const toggleLang = () =>
    dispatch({ type: 'SET_LANG', payload: state.lang === 'id' ? 'en' : 'id' });

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ height: 64 }}
      >
        <div
          className="container h-full flex items-center justify-between"
          style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--primary), #0EA5E9)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(14,165,233,0.35)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Trip<span style={{ color: 'var(--primary)' }}>Nesia</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center" style={{ gap: 4 }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--primary-dim)' : 'transparent',
                    transition: 'all var(--transition)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {state.selectedDestinations.length > 0 && (
              <Link
                to="/itinerary"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-accent)',
                  textDecoration: 'none',
                  transition: 'all var(--transition)',
                }}
              >
                <Map size={14} />
                {state.selectedDestinations.length} dipilih
                <ChevronRight size={13} />
              </Link>
            )}

            <button
              onClick={toggleLang}
              className="btn-ghost btn-sm"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              <Globe size={14} />
              {state.lang === 'id' ? 'ID' : 'EN'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid var(--border)',
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px',
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color var(--transition)',
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
