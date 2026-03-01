import { useState } from 'react';
import ScoreRing from './ScoreRing.jsx';
import { callEnhanceAPI } from '../api.js';
import { buildDiff } from '../utils/diff.js';
import { RISK_COLORS, TAG_COLORS } from '../constants.js';

export default function EnhanceView({ initialPrompt, onPromptChange }) {
  const [raw, setRaw]         = useState(initialPrompt || '');
  const [ctx, setCtx]         = useState('');
  const [preserve, setPreserve] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);

  const analyze = async () => {
    if (!raw.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await callEnhanceAPI(raw, ctx, preserve);
      setResult({ ...data, ...buildDiff(raw, data.enhanced, data.risky_phrases) });
    } catch (e) {
      setError('Enhancement failed — ' + e.message);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result.enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => { setRaw(''); setResult(null); setError(null); setCtx(''); setPreserve(''); };

  const wordCount = raw.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fu">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
          Compile your prompt.<br />
          <span style={{ color: '#d4a96a' }}>Eliminate hallucinations.</span>
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#3a3228', letterSpacing: '0.5px' }}>
          Paste any prompt — scored, annotated, and enhanced by Claude.
        </p>
      </div>

      {/* Input grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>RAW PROMPT</label>
          <textarea
            value={raw}
            onChange={(e) => { setRaw(e.target.value); onPromptChange?.(e.target.value); }}
            placeholder="Paste any prompt — even a rough one-liner. We'll fix it."
            rows={8}
            style={textareaStyle}
            onFocus={(e) => (e.target.style.borderColor = '#d4a96a')}
            onBlur={(e)  => (e.target.style.borderColor = '#1e1a16')}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>CONTEXT <span style={{ color: '#1e1a16' }}>(optional)</span></label>
            <textarea
              value={ctx} onChange={(e) => setCtx(e.target.value)}
              placeholder="Language, framework, audience, environment..."
              rows={3} style={{ ...textareaStyle, resize: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = '#d4a96a')}
              onBlur={(e)  => (e.target.style.borderColor = '#1e1a16')}
            />
          </div>
          <div>
            <label style={labelStyle}>
              PRESERVATION CONSTRAINT <span style={{ color: '#1e1a16' }}>what must NOT change</span>
            </label>
            <textarea
              value={preserve} onChange={(e) => setPreserve(e.target.value)}
              placeholder="'Keep tone casual', 'Preserve the persona name'..."
              rows={3}
              style={{ ...textareaStyle, resize: 'none', borderColor: preserve ? '#d4a96a44' : '#1e1a16' }}
              onFocus={(e) => (e.target.style.borderColor = '#d4a96a')}
              onBlur={(e)  => (e.target.style.borderColor = preserve ? '#d4a96a44' : '#1e1a16')}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 36 }}>
        <button
          onClick={analyze}
          disabled={!raw.trim() || loading}
          style={{
            padding: '12px 32px',
            background: raw.trim() && !loading ? '#d4a96a' : '#1a1510',
            border: 'none', borderRadius: 3,
            color: raw.trim() && !loading ? '#0a0a0a' : '#2a2218',
            fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '2px',
            cursor: raw.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all .2s',
          }}
        >
          {loading ? 'ANALYZING…' : '✦  ANALYZE & ENHANCE'}
        </button>
        {(raw || result) && !loading && (
          <button onClick={clear} style={ghostBtn}>CLEAR</button>
        )}
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#1e1a16', marginLeft: 'auto' }}>
          {wordCount} words · ~{Math.ceil(raw.length / 4)} tokens
        </span>
      </div>

      {/* Shimmer loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
            {[0, 1, 2, 3].map((i) => <div key={i} className="shim" style={{ height: 80, width: 80 }} />)}
          </div>
          {[100, 85, 72, 58].map((w, i) => (
            <div key={i} className="shim" style={{ height: 13, width: `${w}%` }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: 16, border: '1px solid #ef444433', borderRadius: 3, color: '#fca5a5', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="fu">
          {/* Metrics bar */}
          <div style={{ display: 'flex', gap: 20, padding: '18px 24px', background: '#0d0d0d', border: '1px solid #1e1a16', borderRadius: 4, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <ScoreRing score={result.score_before} label="BEFORE" />
            <span style={{ fontSize: 18, color: '#1e1a16' }}>→</span>
            <ScoreRing score={result.score_after} label="AFTER" />
            <div style={{ width: 1, height: 56, background: '#1a1510', margin: '0 8px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div>
                  <div style={metricLabel}>HALLUCINATION RISK</div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: RISK_COLORS[result.hallucination_risk], padding: '3px 10px', borderRadius: 2, border: `1px solid ${RISK_COLORS[result.hallucination_risk]}33`, background: `${RISK_COLORS[result.hallucination_risk]}11` }}>
                    {result.hallucination_risk}
                  </span>
                </div>
                <div>
                  <div style={metricLabel}>SPECIFICITY AFTER</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 90, height: 4, background: '#1a1510', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.specificity_after}%`, background: '#d4a96a', borderRadius: 2, transition: 'width 1.2s ease' }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#d4a96a' }}>{result.specificity_after}%</span>
                  </div>
                </div>
                <div>
                  <div style={metricLabel}>SCORE DELTA</div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                    +{result.score_after - result.score_before} pts
                  </span>
                </div>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#4a4035', fontStyle: 'italic' }}>{result.summary}</p>
            </div>
          </div>

          {/* Diff panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
            <div style={{ border: '1px solid #1e1a16', borderRadius: 4, overflow: 'hidden' }}>
              <div style={panelHeader}>
                <span style={monoLabel}>ORIGINAL</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16' }}>~{Math.ceil(raw.length / 4)} tokens</span>
              </div>
              <div style={diffPanel} dangerouslySetInnerHTML={{ __html: result.origHtml }} />
            </div>
            <div style={{ border: '1px solid #d4a96a33', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ ...panelHeader, background: '#0e0b08', borderColor: '#d4a96a1a' }}>
                <span style={{ ...monoLabel, color: '#d4a96a' }}>ENHANCED</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#2a2218' }}>~{Math.ceil(result.enhanced.length / 4)} tokens</span>
                  <button onClick={copy} style={{ background: 'none', border: '1px solid #d4a96a44', borderRadius: 2, padding: '3px 10px', color: '#d4a96a', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, cursor: 'pointer' }}>
                    {copied ? 'COPIED ✓' : 'COPY'}
                  </button>
                </div>
              </div>
              <div style={{ ...diffPanel, color: '#c8b89e' }} dangerouslySetInnerHTML={{ __html: result.enhHtml }} />
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
            {[
              ['risky', 'rgba(239,68,68,.22)', '#fca5a5', 'risky / ungrounded phrases'],
              ['added', 'rgba(6,182,212,.18)',  '#67e8f9', 'injected improvements'],
            ].map(([cls, bg, color, label]) => (
              <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: bg, color, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: '1px 6px', borderRadius: 2 }}>abc</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#2a2218' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Changes */}
          <div style={{ border: '1px solid #1a1510', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '9px 16px', background: '#0d0d0d', borderBottom: '1px solid #1a1510' }}>
              <span style={monoLabel}>WHAT CHANGED & WHY</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(result.changes || []).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '1px', fontWeight: 700, color: TAG_COLORS[c.tag] || '#6b6055', background: `${TAG_COLORS[c.tag] || '#6b6055'}15`, border: `1px solid ${TAG_COLORS[c.tag] || '#6b6055'}33`, padding: '2px 8px', borderRadius: 2, whiteSpace: 'nowrap', marginTop: 1 }}>
                    {c.tag}
                  </span>
                  <p style={{ fontSize: 12, color: '#5a5047', lineHeight: 1.65 }}>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared styles
const labelStyle = { fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '2px', color: '#3a3228', display: 'block', marginBottom: 6 };
const metricLabel = { fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#3a3228', letterSpacing: '1.5px', marginBottom: 5 };
const monoLabel   = { fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#3a3228', letterSpacing: '2px' };
const panelHeader = { padding: '9px 16px', background: '#0d0d0d', borderBottom: '1px solid #1e1a16', display: 'flex', justifyContent: 'space-between' };
const diffPanel   = { padding: 16, fontSize: 12, lineHeight: 1.8, color: '#5a5047', minHeight: 120, whiteSpace: 'pre-wrap' };
const ghostBtn    = { background: 'none', border: 'none', color: '#2a2218', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, cursor: 'pointer' };
const textareaStyle = { width: '100%', background: '#0d0d0d', border: '1px solid #1e1a16', borderRadius: 3, padding: 14, color: '#e8e0d4', fontSize: 13, lineHeight: 1.75, resize: 'vertical', fontFamily: 'Georgia,serif', transition: 'border-color .2s' };
