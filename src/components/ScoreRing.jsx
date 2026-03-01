export default function ScoreRing({ score, label, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1a16" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text
          x={size / 2} y={size / 2 + 5}
          textAnchor="middle" fill={color}
          fontSize={size * 0.22}
          fontFamily="'JetBrains Mono',monospace"
          fontWeight="700"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {score}
        </text>
      </svg>
      <span style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 9, color: '#4a4035', letterSpacing: '1.5px',
      }}>
        {label}
      </span>
    </div>
  );
}
