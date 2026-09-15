import type { ItineraryDay, RouteSegment } from '../types';
import { formatCurrency, formatDuration } from '../utils/routeOptimizer';
import { MapPin, Clock, DollarSign, Navigation } from 'lucide-react';

interface Props {
  days: ItineraryDay[];
  segments: RouteSegment[];
}

const CATEGORY_COLORS: Record<string, string> = {
  nature:        '#22C55E',
  culture:       '#A855F7',
  culinary:      '#F59E0B',
  shopping:      '#EC4899',
  entertainment: '#EF4444',
  family:        '#3B82F6',
  all:           '#0EA5E9',
};

export default function Timeline({ days, segments }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {days.map((day) => (
        <div key={day.day}>
          {/* Day header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36, height: 36, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800, fontSize: 14, color: 'white',
              }}
            >
              {day.day}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 14,
                  color: 'var(--text-primary)',
                }}
              >
                Hari ke-{day.day}
              </div>
              {day.date && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{day.date}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                <MapPin size={11} /> {day.destinations.length}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                <DollarSign size={11} /> {formatCurrency(day.totalCost)}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Vertical track */}
            <div
              style={{
                position: 'absolute',
                left: 12, top: 0, bottom: 0,
                width: 1,
                background: 'linear-gradient(to bottom, var(--primary-border), transparent)',
              }}
            />

            {day.destinations.map((dest, i) => {
              const startHour = 8 + i * 2;
              const timeStr = `${String(startHour).padStart(2, '0')}.00`;
              const color = CATEGORY_COLORS[dest.category] || '#0EA5E9';
              const isFree = dest.estimatedCost === 0;

              const segAfter = segments.find(
                (s) => s.from.id === dest.id && day.destinations[i + 1]?.id === s.to.id
              );

              return (
                <div key={dest.id}>
                  {/* Timeline item */}
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    {/* Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -23,
                        top: 14,
                        width: 22, height: 22,
                        borderRadius: '50%',
                        background: 'var(--bg-base)',
                        border: `2px solid ${color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800, fontSize: 10, color: color,
                        zIndex: 1,
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Card */}
                    <div
                      style={{
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '14px 16px',
                        transition: 'border-color var(--transition)',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `${color}40`)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
                    >
                      <div
                        style={{
                          display: 'flex', alignItems: 'flex-start',
                          justifyContent: 'space-between', gap: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Time + category */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span
                              style={{
                                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
                                padding: '2px 8px',
                                background: 'var(--primary-dim)',
                                color: 'var(--primary)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              {timeStr}
                            </span>
                            <span
                              style={{
                                fontSize: 11, fontWeight: 600,
                                padding: '2px 8px',
                                background: `${color}15`,
                                color: color,
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              {dest.category}
                            </span>
                          </div>

                          {/* Name */}
                          <h4
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700, fontSize: 14,
                              color: 'var(--text-primary)',
                              marginBottom: 4,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {dest.name}
                          </h4>

                          {/* Description */}
                          <p
                            style={{
                              fontSize: 12, color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {dest.description}
                          </p>
                        </div>

                        {/* Right side */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div
                            style={{
                              fontSize: 14, fontWeight: 700,
                              color: isFree ? 'var(--success)' : 'var(--primary)',
                              fontFamily: 'var(--font-display)',
                              marginBottom: 4,
                            }}
                          >
                            {formatCurrency(dest.estimatedCost)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', justifyContent: 'flex-end' }}>
                            <Clock size={10} /> ~2 jam
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Travel segment */}
                  {segAfter && (
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px',
                        marginBottom: 8,
                        fontSize: 12, color: 'var(--text-muted)',
                      }}
                    >
                      <Navigation size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      Ke {segAfter.to.name} · {segAfter.distance} km · {formatDuration(segAfter.duration)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
