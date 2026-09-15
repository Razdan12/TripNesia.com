import { useState, useRef, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';
import { strings } from '../i18n';
import type { ChatMessage } from '../types';
import { Bot, Send, User, Sparkles } from 'lucide-react';

const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY || '';

async function askFalAI(messages: { role: string; content: string }[]): Promise<string> {
  if (!FAL_API_KEY) {
    return 'API key fal.ai belum dikonfigurasi. Tambahkan `VITE_FAL_API_KEY` ke file `.env` untuk mengaktifkan fitur AI.';
  }
  try {
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
    const chatHistory = messages.filter((m) => m.role !== 'system');

    // Format conversation history for prompt
    let promptText = '';
    if (chatHistory.length === 1) {
      promptText = chatHistory[0].content;
    } else {
      promptText = chatHistory
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n') + '\n\nAssistant:';
    }

    const res = await fetch('https://fal.run/fal-ai/any-llm', {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        prompt: promptText,
        system_prompt: systemMsg,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Fal.ai API error:', errBody);
      throw new Error(errBody);
    }
    const data = await res.json();
    return data.output || data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.';
  } catch (err) {
    console.error('AI Error:', err);
    return 'Terjadi kesalahan saat memproses pertanyaan. Silakan coba lagi.';
  }
}

const SUGGESTIONS = [
  { id: 's1', icon: '🏝️', text: 'Tips wisata Bali dengan budget hemat?' },
  { id: 's2', icon: '🍜', text: 'Kuliner wajib coba di Yogyakarta?' },
  { id: 's3', icon: '⛰️', text: 'Kapan waktu terbaik ke Raja Ampat?' },
  { id: 's4', icon: '🎒', text: 'Persiapan pendakian Gunung Rinjani?' },
];

export default function AssistantPage() {
  const { state, dispatch } = useTravel();
  const t = strings[state.lang as 'id' | 'en'];
  const lang = state.lang as 'id' | 'en';
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages]);

  const systemPrompt = `Kamu adalah AI Travel Assistant untuk TripNesia, platform wisata Indonesia. Bantu user merencanakan perjalanan, rekomendasikan tempat wisata, berikan tips travel, dan info tentang destinasi di Indonesia. ${state.city ? `User berencana ke ${state.city} dengan budget Rp ${state.budget.toLocaleString('id-ID')}.` : ''} Jawab singkat, friendly, gunakan emoji yang relevan. Bahasa mengikuti bahasa pertanyaan user (Indonesia atau Inggris).`;

  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMsg });
    setInput('');
    setLoading(true);

    const history = [
      { role: 'system', content: systemPrompt },
      ...state.chatMessages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      { role: 'user', content: msg },
    ];

    const reply = await askFalAI(history);
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() } });
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const hasMessages = state.chatMessages.length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        paddingTop: 64,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 760,
          width: '100%',
          margin: '0 auto',
          padding: '32px 24px 100px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            className="anim-float"
            style={{
              width: 60, height: 60,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              borderRadius: 'var(--radius-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            <Bot size={26} color="white" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 26,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em', marginBottom: 6,
            }}
          >
            {t.aiTitle}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.aiSubtitle}</p>
          {state.city && (
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 10,
                padding: '4px 14px',
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius-full)',
                fontSize: 13, color: 'var(--primary)', fontWeight: 500,
              }}
            >
              📍 Konteks: {state.city} · {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(state.budget)}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div
          style={{
            flex: 1,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: 20,
            minHeight: 400,
            maxHeight: 'calc(100vh - 340px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 16,
          }}
        >
          {!hasMessages ? (
            /* Empty state */
            <div
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 20,
                padding: 24, textAlign: 'center',
              }}
            >
              <Sparkles size={36} style={{ color: 'var(--primary)', opacity: 0.6 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                {lang === 'id'
                  ? 'Tanyakan apa saja seputar wisata Indonesia!'
                  : 'Ask anything about traveling in Indonesia!'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 480 }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSend(s.text)}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                      fontSize: 13, textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                      lineHeight: 1.4,
                      fontFamily: 'var(--font-sans)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                    }}
                  >
                    <span style={{ display: 'block', fontSize: 18, marginBottom: 4 }}>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {state.chatMessages.map((msg: ChatMessage) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className="anim-fade-up"
                    style={{
                      display: 'flex',
                      gap: 12,
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 32, height: 32, flexShrink: 0,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isUser
                          ? 'var(--accent)'
                          : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                      }}
                    >
                      {isUser ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: 14, lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                        ...(isUser
                          ? {
                              background: 'var(--accent-dim)',
                              border: '1px solid var(--accent-border)',
                              color: 'var(--text-primary)',
                            }
                          : {
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-primary)',
                            }),
                      }}
                    >
                      {msg.content}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: isUser ? 'right' : 'left' }}>
                        {msg.timestamp.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }} className="anim-fade-in">
                  <div
                    style={{
                      width: 32, height: 32,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                    }}
                  >
                    <Bot size={14} color="white" />
                  </div>
                  <div
                    style={{
                      padding: '12px 20px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '18px 18px 18px 4px',
                      display: 'flex', gap: 4, alignItems: 'center',
                    }}
                  >
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div
                        key={i}
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--primary)',
                          animation: `float 1s ease-in-out ${delay}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            display: 'flex', gap: 10,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 8px 8px 16px',
          }}
        >
          <input
            ref={inputRef}
            id="ai-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t.aiPlaceholder}
            disabled={loading}
            style={{
              flex: 1,
              background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            id="ai-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: input.trim() && !loading ? 'var(--primary)' : 'var(--bg-elevated)',
              color: input.trim() && !loading ? 'white' : 'var(--text-muted)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition)',
              flexShrink: 0,
            }}
          >
            {loading ? (
              <span style={{ width: 14, height: 14, border: '2px solid var(--text-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            ) : <Send size={16} />}
          </button>
        </div>

        {!FAL_API_KEY && (
          <p style={{ fontSize: 12, color: 'var(--warning)', textAlign: 'center', marginTop: 12 }}>
            ⚠️ Tambahkan <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>VITE_FAL_API_KEY</code> di file <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>.env</code> untuk mengaktifkan AI Chat
          </p>
        )}
      </div>
    </div>
  );
}
