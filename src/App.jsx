import { useState, useEffect, useRef } from 'react';
import EnhanceView from './components/EnhanceView.jsx';
import BrowseView from './components/BrowseView.jsx';

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 420px; min-height: 600px; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #2a2218; border-radius: 2px; }
  mark.risky { background: rgba(239,68,68,.22); color: #fca5a5; border-radius: 2px; padding: 0 2px; }
  mark.added { background: rgba(6,182,212,.18); color: #67e8f9; border-radius: 2px; padding: 0 2px; }
  .nav { cursor: pointer; position: relative; transition: color .2s; }
  .nav::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px; background: #d4a96a; transition: width .3s; }
  .nav.active::after, .nav:hover::after { width: 100%; }
  textarea:focus, input:focus { outline: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .fu { animation: fadeUp .4s ease forwards; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .shim { background: linear-gradient(90deg, #1a1510 25%, #2a2218 50%, #1a1510 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 3px; }
  .card { transition: transform .2s, border-color .2s; cursor: pointer; }
  .card:hover { transform: translateY(-2px); border-color: #3a3228 !important; }
`;

export default function App() {
  const [view, setView]       = useState('enhance');
  const [loadedPrompt, setLoadedPrompt] = useState('');
  const [mounted, setMounted] = useState(false);
  const styleRef = useRef(null);

  useEffect(() => {
    // Inject global styles once
    const style = document.createElement('style');
    style.textContent = GLOBAL_STYLES;
    document.head.appendChild(style);
    styleRef.current = style;
    setTimeout(() => setMounted(true), 50);
    return () => style.remove();
  }, []);

  const handleLoadPrompt = (content) => {
    setLoadedPrompt(content);
    setView('enhance');
  };

  return (
    <div style={{
      fontFamily: 'Georgia,serif',
      background: '#0a0a0a',
      width: 420,
      minHeight: 600,
      color: '#e8e0d4',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'none' : 'translateY(8px)',
      transition: 'opacity .5s, transform .5s',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1a1510',
        padding: '0 16px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,10,.96)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#d4a96a' }}>
            PromptSage
          </span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#2a2218', letterSpacing: '3px' }}>
            BETA
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 32 }}>
          {[['enhance', 'Enhance'], ['browse', 'Browse']].map(([id, label]) => (
            <span
              key={id}
              className={`nav ${view === id ? 'active' : ''}`}
              onClick={() => setView(id)}
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 11,
                letterSpacing: '1.5px',
                color: view === id ? '#d4a96a' : '#3a3228',
                paddingBottom: 2,
              }}
            >
              {label.toUpperCase()}
            </span>
          ))}
        </nav>

        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16' }}>
          gemini
        </span>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px' }}>
        {view === 'enhance' && (
          <EnhanceView
            key={loadedPrompt}
            initialPrompt={loadedPrompt}
          />
        )}
        {view === 'browse' && (
          <BrowseView onLoadPrompt={handleLoadPrompt} />
        )}
      </main>
    </div>
  );
}
