import { useState, useEffect } from 'react';
import ScoreRing from './ScoreRing.jsx';
import { getSessions, clearSessions } from '../utils/storage.js';
import { RISK_COLORS } from '../constants.js';

const CHANGE_TAG_COLORS = {
  CLARITY:     '#3b82f6',
  STRUCTURE:   '#8b5cf6',
  GUARDRAILS:  '#10b981',
  SPECIFICITY: '#f59e0b',
  CONTEXT:     '#06b6d4',
  TONE:        '#ec4899',
};

export default function AnalyticsView() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => { setSessions(getSessions()); }, []);

  const handleClear = () => {
    clearSessions();
    setSessions([]);
  };

  if (sessions.length === 0) {
    return (
      <div className="fu" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.15 }}>◇</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          No sessions yet
        </h2>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#3a3228' }}>
          Enhance a prompt first — your history will appear here.
        </p>
      </div>
    );
  }

  // --- Derived stats ---
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const avgBefore = Math.round(avg(sessions.map(s => s.score_before)));
  const avgAfter  = Math.round(avg(sessions.map(s => s.score_after)));
  const avgDelta  = Math.round(avg(sessions.map(s => s.score_after - s.score_before)));
  const totalTokens = sessions.reduce((s, x) => s + x.tokens, 0);

  // Hallucination risk breakdown
  const riskCounts = { LOW: 0, MED: 0, HIGH: 0, CRITICAL: 0 };
  sessions.forEach(s => { if (riskCounts[s.hallucination_risk] !== undefined) riskCounts[s.hallucination_risk]++; });
  const riskTotal = sessions.length;

  // Change tag frequency
  const tagFreq = {};
  sessions.forEach(s => s.change_tags.forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
  const tagEntries = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]);
  const maxTagCount = tagEntries.length ? tagEntries[0][1] : 1;

  // Risky phrases histogram
  const phraseFreq = {};
  sessions.forEach(s => s.risky_phrases.forEach(p => { phraseFreq[p] = (phraseFreq[p] || 0) + 1; }));
  const phraseEntries = Object.entries(phraseFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxPhraseCount = phraseEntries.length ? phraseEntries[0][1] : 1;

  // Score delta sparkline
  const deltas = sessions.map(s => s.score_after - s.score_before);
  const maxDelta = Math.max(...deltas, 1);
  const minDelta = Math.min(...deltas, 0);
  const deltaRange = maxDelta - minDelta || 1;

  return (
    <div className="fu">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
          Your prompt journey.<br />
          <span style={{ color: '#d4a96a' }}>Tracked & visualized.</span>
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#3a3228', letterSpacing: '0.5px' }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded · {totalTokens.toLocaleString()} tokens processed
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {/* Avg Before/After */}
        <div style={cardStyle}>
          <div style={cardLabel}>AVG SCORE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <ScoreRing score={avgBefore} label="BEFORE" size={56} />
            <span style={{ fontSize: 16, color: '#1e1a16' }}>→</span>
            <ScoreRing score={avgAfter} label="AFTER" size={56} />
          </div>
        </div>

        {/* Avg Delta */}
        <div style={cardStyle}>
          <div style={cardLabel}>AVG IMPROVEMENT</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: '#10b981', marginTop: 8 }}>
            +{avgDelta}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#3a3228', marginTop: 4 }}>points per session</div>
        </div>

        {/* Sessions & tokens */}
        <div style={cardStyle}>
          <div style={cardLabel}>SESSIONS</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: '#d4a96a', marginTop: 8 }}>
            {sessions.length}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#3a3228', marginTop: 4 }}>
            {totalTokens.toLocaleString()} tokens total
          </div>
        </div>

        {/* Hallucination risk */}
        <div style={cardStyle}>
          <div style={cardLabel}>HALLUCINATION RISK</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {Object.entries(riskCounts).map(([level, count]) => count > 0 && (
              <span key={level} style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
                color: RISK_COLORS[level],
                background: `${RISK_COLORS[level]}15`,
                border: `1px solid ${RISK_COLORS[level]}33`,
                padding: '3px 8px', borderRadius: 2,
              }}>
                {count} {level}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {/* Score delta sparkline */}
        <div style={chartCardStyle}>
          <div style={chartHeader}>
            <span style={monoLabel}>SCORE DELTA TREND</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16' }}>over time →</span>
          </div>
          <div style={{ padding: 16 }}>
            <svg width="100%" height="80" viewBox={`0 0 ${Math.max(deltas.length * 24, 100)} 80`} preserveAspectRatio="none">
              {/* Zero line */}
              <line
                x1="0" x2={deltas.length * 24}
                y1={80 - ((0 - minDelta) / deltaRange) * 70 - 5}
                y2={80 - ((0 - minDelta) / deltaRange) * 70 - 5}
                stroke="#1e1a16" strokeWidth="1" strokeDasharray="4 4"
              />
              {/* Sparkline */}
              <polyline
                fill="none" stroke="#d4a96a" strokeWidth="2" strokeLinejoin="round"
                points={deltas.map((d, i) => `${i * 24 + 12},${80 - ((d - minDelta) / deltaRange) * 70 - 5}`).join(' ')}
              />
              {/* Dots */}
              {deltas.map((d, i) => (
                <circle
                  key={i}
                  cx={i * 24 + 12}
                  cy={80 - ((d - minDelta) / deltaRange) * 70 - 5}
                  r="3" fill="#d4a96a"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Risk breakdown bar */}
        <div style={chartCardStyle}>
          <div style={chartHeader}>
            <span style={monoLabel}>RISK BREAKDOWN</span>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', height: 24, borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
              {Object.entries(riskCounts).map(([level, count]) => count > 0 && (
                <div key={level} style={{
                  width: `${(count / riskTotal) * 100}%`,
                  background: RISK_COLORS[level],
                  transition: 'width .6s ease',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(riskCounts).map(([level, count]) => (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 1, background: RISK_COLORS[level] }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a4035' }}>
                    {level} ({count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change tag distribution */}
        <div style={chartCardStyle}>
          <div style={chartHeader}>
            <span style={monoLabel}>CHANGE CATEGORIES</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tagEntries.length === 0 && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#2a2218' }}>No data</span>
            )}
            {tagEntries.map(([tag, count]) => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '1px', color: CHANGE_TAG_COLORS[tag] || '#6b6055', width: 80, textAlign: 'right', flexShrink: 0 }}>
                  {tag}
                </span>
                <div style={{ flex: 1, height: 14, background: '#111', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(count / maxTagCount) * 100}%`,
                    background: CHANGE_TAG_COLORS[tag] || '#6b6055',
                    borderRadius: 2, transition: 'width .6s ease', opacity: 0.7,
                  }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a4035', width: 20 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risky phrases histogram */}
        <div style={chartCardStyle}>
          <div style={chartHeader}>
            <span style={monoLabel}>MOST FLAGGED PHRASES</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {phraseEntries.length === 0 && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#2a2218' }}>No risky phrases flagged</span>
            )}
            {phraseEntries.map(([phrase, count]) => (
              <div key={phrase} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#fca5a5', width: 120, textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {phrase}
                </span>
                <div style={{ flex: 1, height: 14, background: '#111', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(count / maxPhraseCount) * 100}%`,
                    background: 'rgba(239,68,68,.4)',
                    borderRadius: 2, transition: 'width .6s ease',
                  }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a4035', width: 20 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clear button */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <button onClick={handleClear} style={{
          background: 'none', border: '1px solid #1e1a16', borderRadius: 3,
          padding: '8px 24px', color: '#3a3228',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '1.5px',
          cursor: 'pointer', transition: 'border-color .2s, color .2s',
        }}>
          CLEAR HISTORY
        </button>
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  padding: 18, background: '#0d0d0d', border: '1px solid #1e1a16', borderRadius: 4,
};
const cardLabel = {
  fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '2px', color: '#3a3228',
};
const chartCardStyle = {
  border: '1px solid #1e1a16', borderRadius: 4, overflow: 'hidden',
};
const chartHeader = {
  padding: '9px 16px', background: '#0d0d0d', borderBottom: '1px solid #1e1a16',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const monoLabel = {
  fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#3a3228', letterSpacing: '2px',
};
