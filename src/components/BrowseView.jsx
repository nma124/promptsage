import { useState } from 'react';
import { LIBRARY, CATEGORIES, CAT_COLORS } from '../constants.js';

export default function BrowseView({ onLoadPrompt }) {
  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = LIBRARY.filter(
    (p) =>
      (activeCat === 'All' || p.category === activeCat) &&
      (!search || p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fu">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
          Proven patterns.<br />
          <span style={{ color: '#d4a96a' }}>Community validated.</span>
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#3a3228' }}>
          Load any template into the enhancer to refine it further.
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search prompts..."
        style={{ width: '100%', background: '#0d0d0d', border: '1px solid #1e1a16', borderRadius: 3, padding: '11px 16px', color: '#e8e0d4', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, marginBottom: 18, transition: 'border-color .2s', outline: 'none' }}
        onFocus={(e) => (e.target.style.borderColor = '#d4a96a')}
        onBlur={(e)  => (e.target.style.borderColor = '#1e1a16')}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <span
            key={cat}
            onClick={() => setActiveCat(cat)}
            style={{ padding: '5px 12px', borderRadius: 2, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${activeCat === cat ? '#d4a96a' : '#1e1a16'}`, background: activeCat === cat ? '#1e1a16' : 'transparent', color: activeCat === cat ? '#d4a96a' : '#3a3228', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '1px' }}
          >
            {cat.toUpperCase()}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="card"
            onClick={() => onLoadPrompt(p.content)}
            style={{ border: '1px solid #1a1510', borderRadius: 4, padding: 20, background: '#0d0d0d', opacity: 1, transition: `opacity .4s ease ${i * 0.07}s, transform .4s ease ${i * 0.07}s, border-color .2s` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '1.5px', color: CAT_COLORS[p.category] || '#6b6055', padding: '2px 8px', borderRadius: 2, border: `1px solid ${CAT_COLORS[p.category] || '#6b6055'}22`, background: `${CAT_COLORS[p.category] || '#6b6055'}10` }}>
                {p.category.toUpperCase()}
              </span>
              <span style={{ color: '#d4a96a', fontSize: 11 }}>★ {p.rating}</span>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
            <p style={{ fontSize: 12, color: '#3a3228', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {p.content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {p.tags.map((t) => (
                  <span key={t} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16', padding: '2px 6px', border: '1px solid #1a1510', borderRadius: 2 }}>
                    #{t}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#1e1a16' }}>{p.uses.toLocaleString()} uses</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: p.trend > 0 ? '#10b981' : '#ef4444' }}>
                  {p.trend > 0 ? '↑' : '↓'}{Math.abs(p.trend)}%
                </span>
              </div>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #111', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16', letterSpacing: '1px' }}>
              → CLICK TO LOAD IN ENHANCER
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
