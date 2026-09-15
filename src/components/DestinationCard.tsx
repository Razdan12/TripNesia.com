import type { Destination } from '../types';
import { useTravel } from '../context/TravelContext';
import { formatCurrency } from '../utils/routeOptimizer';
import { MapPin, Star, Clock, Check, Plus } from 'lucide-react';

interface Props {
  destination: Destination;
  animDelay?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  nature: '#22C55E',
  culture: '#A855F7',
  culinary: '#F59E0B',
  shopping: '#EC4899',
  entertainment: '#EF4444',
  family: '#3B82F6',
  all: '#0EA5E9',
};

const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  nature:        { id: 'Alam', en: 'Nature' },
  culture:       { id: 'Budaya', en: 'Culture' },
  culinary:      { id: 'Kuliner', en: 'Culinary' },
  shopping:      { id: 'Belanja', en: 'Shopping' },
  entertainment: { id: 'Hiburan', en: 'Entertainment' },
  family:        { id: 'Keluarga', en: 'Family' },
  all:           { id: 'Lainnya', en: 'Other' },
};

const PLACEHOLDER_IMAGES: Record<string, string> = {
  nature:        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=480&q=75',
  culture:       'https://images.unsplash.com/photo-1580555543574-a694dcb9a3e2?w=480&q=75',
  culinary:      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=480&q=75',
  shopping:      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=480&q=75',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=480&q=75',
  family:        'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=480&q=75',
  all:           'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=480&q=75',
};

export default function DestinationCard({ destination, animDelay = 0 }: Props) {
  const { state, dispatch } = useTravel();
  const isSelected = state.selectedDestinations.some((d: Destination) => d.id === destination.id);
  const lang = state.lang as 'id' | 'en';

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_DESTINATION', payload: destination });
  };

  const color = CATEGORY_COLORS[destination.category] || '#0EA5E9';
  const catLabel = CATEGORY_LABELS[destination.category]?.[lang] || destination.category;
  const imgUrl = PLACEHOLDER_IMAGES[destination.category] || PLACEHOLDER_IMAGES.all;
  const isFree = destination.estimatedCost === 0;

  return (
    <div
      className="anim-fade-up"
      style={{
        animationDelay: `${animDelay}s`,
        background: 'var(--bg-surface)',
        border: isSelected
          ? '1px solid var(--primary)'
          : '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        boxShadow: isSelected ? '0 0 0 1px var(--primary), 0 8px 32px rgba(14,165,233,0.15)' : 'none',
        transform: isSelected ? 'translateY(-2px)' : 'none',
      }}
      onClick={toggle}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.transform = 'none';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img
          src={imgUrl}
          alt={destination.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-slow)',
          }}
          onError={(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.all)}
          onMouseEnter={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1)')}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(5,11,24,0.9) 0%, rgba(5,11,24,0.2) 50%, transparent 100%)',
          }}
        />

        {/* Category tag */}
        <div
          style={{
            position: 'absolute', top: 12, left: 12,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            background: `${color}22`,
            border: `1px solid ${color}44`,
            borderRadius: 'var(--radius-full)',
            fontSize: 11,
            fontWeight: 600,
            color: color,
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
          {catLabel}
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <div
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 28, height: 28,
              background: 'var(--primary)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(14,165,233,0.5)',
            }}
          >
            <Check size={14} color="white" strokeWidth={2.5} />
          </div>
        )}

        {/* Accessible tag */}
        {destination.accessible && (
          <div
            style={{
              position: 'absolute', bottom: 10, right: 10,
              fontSize: 11,
              padding: '2px 8px',
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--success)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}
          >
            ♿ Aksesibel
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Name */}
        <h3
          className="line-clamp-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--text-primary)',
            marginBottom: 5,
            letterSpacing: '-0.01em',
          }}
        >
          {destination.name}
        </h3>

        {/* Description */}
        <p
          className="line-clamp-2"
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {destination.description}
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {destination.rating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                {destination.rating.toFixed(1)}
              </span>
            )}
            {destination.openingHours && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Clock size={11} />
                {destination.openingHours.length > 12 ? 'Lihat jam' : destination.openingHours}
              </span>
            )}
            {destination.address && (
              <span
                className="line-clamp-1"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}
              >
                <MapPin size={10} />
                {destination.address}
              </span>
            )}
          </div>

          {/* Cost badge */}
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 700,
              ...(isFree
                ? { background: 'var(--success-dim)', color: 'var(--success)' }
                : { background: 'var(--primary-dim)', color: 'var(--primary)' }
              ),
            }}
          >
            {formatCurrency(destination.estimatedCost)}
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={toggle}
          style={{
            width: '100%',
            padding: '9px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all var(--transition)',
            border: '1px solid',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            ...(isSelected
              ? {
                  background: 'var(--primary-dim)',
                  color: 'var(--primary)',
                  borderColor: 'var(--primary-border)',
                }
              : {
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border)',
                }),
          }}
        >
          {isSelected
            ? <><Check size={13} /> Ditambahkan</>
            : <><Plus size={13} /> Tambah ke Trip</>}
        </button>
      </div>
    </div>
  );
}
