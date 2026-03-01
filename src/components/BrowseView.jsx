import { useState, useMemo } from 'react';
import { LIBRARY, CATEGORIES, CAT_COLORS } from '../constants.js';
import { getVotes, setVote, getUserComments, addUserComment } from '../utils/storage.js';

const SORT_OPTIONS = ['Hot', 'Top', 'New', 'Trending'];

const AUTHORS = ['sage_crafter', 'prompt_whiz', 'ai_alchemist', 'token_smith', 'neural_poet', 'context_king', 'chain_builder'];
const TIME_LABELS = ['2h ago', '5h ago', '12h ago', '1d ago', '2d ago', '3d ago', '5d ago', '1w ago', '2w ago'];

// Seed comments per prompt id
const SEED_COMMENTS = {
  1:  [{ author: 'neural_poet', time: '1d ago', text: 'This catches so many edge cases I would have missed. Game changer for PR reviews.' },
       { author: 'token_smith', time: '3h ago', text: 'I added "focus on security vulnerabilities" to the context and it got even better.' }],
  2:  [{ author: 'chain_builder', time: '2d ago', text: 'Perfect for demos. Students love it.' }],
  3:  [{ author: 'ai_alchemist', time: '5h ago', text: 'Got a working ERC-721 contract on the first try with this.' }],
  6:  [{ author: 'prompt_whiz', time: '12h ago', text: 'The "never give direct answers" constraint is what makes this work so well.' },
       { author: 'sage_crafter', time: '4h ago', text: 'I use this daily for onboarding new engineers. Highly recommend.' }],
  11: [{ author: 'context_king', time: '1d ago', text: 'Got genuinely useful feedback on my Series A deck. Brutal but fair.' }],
  14: [{ author: 'neural_poet', time: '6h ago', text: 'Practiced for my Google interview with this. The questions were spot on.' },
       { author: 'ai_alchemist', time: '2h ago', text: 'Tip: specify the role and level for more targeted questions.' }],
  20: [{ author: 'token_smith', time: '3d ago', text: 'This actually changed my mind on a topic. The counterarguments were that strong.' }],
  21: [{ author: 'sage_crafter', time: '1d ago', text: 'Wrote my college application essay with this. Got in!' }],
  25: [{ author: 'prompt_whiz', time: '8h ago', text: 'Turned my quarterly metrics into a narrative my CEO actually read.' }],
  26: [{ author: 'chain_builder', time: '2d ago', text: 'The recommendations section alone was worth it.' }],
};

export default function BrowseView({ onLoadPrompt }) {
  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sort, setSort]           = useState('Hot');
  const [expandedId, setExpandedId] = useState(null);
  const [votes, setVotes]         = useState(() => getVotes());
  const [userVoted, setUserVoted] = useState({});
  const [hoverId, setHoverId]     = useState(null);
  const [copiedId, setCopiedId]   = useState(null);
  const [userComments, setUserComments] = useState(() => getUserComments());
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText]   = useState('');

  const handleVote = (e, id, delta) => {
    e.stopPropagation();
    const prev = userVoted[id] || 0;
    if (prev === delta) return;
    const actualDelta = prev === 0 ? delta : delta * 2;
    const newVotes = setVote(id, actualDelta);
    setVotes(newVotes);
    setUserVoted(v => ({ ...v, [id]: prev === delta ? 0 : delta }));
  };

  const handleCopy = (e, content, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleComment = (e, id) => {
    e.stopPropagation();
    if (commentingId === id) {
      setCommentingId(null);
      setCommentText('');
    } else {
      setCommentingId(id);
      setCommentText('');
      if (expandedId !== id) setExpandedId(id);
    }
  };

  const submitComment = (e, id) => {
    e.stopPropagation();
    if (!commentText.trim()) return;
    const updated = addUserComment(id, commentText.trim());
    setUserComments(updated);
    setCommentText('');
    setCommentingId(null);
  };

  const getScore = (p) => p.uses + (votes[p.id] || 0);

  const filtered = useMemo(() => {
    let items = LIBRARY.filter((p) => {
      if (activeCat !== 'All' && p.category !== activeCat) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.includes(q));
    });

    const scoreFn = {
      Hot:      (a, b) => (getScore(b) * 0.6 + b.trend * 10 + b.rating * 100) - (getScore(a) * 0.6 + a.trend * 10 + a.rating * 100),
      Top:      (a, b) => getScore(b) - getScore(a),
      New:      (a, b) => b.id - a.id,
      Trending: (a, b) => b.trend - a.trend,
    };

    return [...items].sort(scoreFn[sort] || scoreFn.Hot);
  }, [search, activeCat, sort, votes]);

  return (
    <div className="fu">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
          Proven patterns.<br />
          <span style={{ color: '#d4a96a' }}>Community validated.</span>
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#3a3228' }}>
          {LIBRARY.length} prompts · Browse, vote, and discover what works.
        </p>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search prompts..."
        style={searchStyle}
        onFocus={(e) => (e.target.style.borderColor = '#d4a96a')}
        onBlur={(e)  => (e.target.style.borderColor = '#1e1a16')}
      />

      {/* Categories + Sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', gap: 4 }}>
          {SORT_OPTIONS.map(s => (
            <span
              key={s}
              onClick={() => setSort(s)}
              style={{ padding: '4px 10px', borderRadius: 2, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.5px', color: sort === s ? '#d4a96a' : '#2a2218', background: sort === s ? '#d4a96a11' : 'transparent', border: `1px solid ${sort === s ? '#d4a96a33' : 'transparent'}`, transition: 'all .2s' }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#2a2218', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
            No prompts match your search.
          </div>
        )}
        {filtered.map((p) => {
          const isExpanded = expandedId === p.id;
          const isHovered = hoverId === p.id;
          const score = getScore(p);
          const voted = userVoted[p.id] || 0;
          const author = AUTHORS[p.id % AUTHORS.length];
          const timeAgo = TIME_LABELS[p.id % TIME_LABELS.length];
          const seedComments = SEED_COMMENTS[p.id] || [];
          const myComments = userComments[p.id] || [];
          const allComments = [...seedComments, ...myComments];

          return (
            <div
              key={p.id}
              onMouseEnter={() => { setHoverId(p.id); setExpandedId(p.id); }}
              onMouseLeave={() => { setHoverId(null); setExpandedId(null); setCommentingId(null); setCommentText(''); }}
              style={{
                display: 'flex',
                border: `1px solid ${isHovered || isExpanded ? '#2a2218' : '#1a1510'}`,
                borderRadius: 4,
                background: isExpanded ? '#0e0c09' : isHovered ? '#0d0b08' : '#0d0d0d',
                transition: 'background .2s, border-color .2s, transform .2s',
                overflow: 'hidden',
                transform: isHovered && !isExpanded ? 'translateY(-1px)' : 'none',
              }}
            >
              {/* Vote column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', gap: 2, minWidth: 52, background: isHovered ? '#0c0a08' : '#0a0a0a', borderRight: '1px solid #1a1510', transition: 'background .2s' }}>
                <button
                  onClick={(e) => handleVote(e, p.id, 1)}
                  style={{ ...voteBtn, color: voted === 1 ? '#d4a96a' : isHovered ? '#4a4035' : '#2a2218', transform: voted === 1 ? 'scale(1.2)' : 'scale(1)', transition: 'color .15s, transform .15s' }}
                  title="Upvote"
                >
                  ▲
                </button>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: voted !== 0 ? '#d4a96a' : isHovered ? '#6b6055' : '#4a4035', minWidth: 24, textAlign: 'center', transition: 'color .2s' }}>
                  {score >= 1000 ? `${(score / 1000).toFixed(1)}k` : score}
                </span>
                <button
                  onClick={(e) => handleVote(e, p.id, -1)}
                  style={{ ...voteBtn, color: voted === -1 ? '#6366f1' : isHovered ? '#4a4035' : '#2a2218', transform: voted === -1 ? 'scale(1.2)' : 'scale(1)', transition: 'color .15s, transform .15s' }}
                  title="Downvote"
                >
                  ▼
                </button>
                <div style={{ width: '70%', height: 1, background: '#1a1510', margin: '6px 0' }} />
                <button
                  onClick={(e) => handleComment(e, p.id)}
                  style={{ ...voteBtn, color: commentingId === p.id ? '#d4a96a' : isHovered ? '#4a4035' : '#2a2218', transition: 'color .15s', fontSize: 13 }}
                  title="Comment"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#2a2218', textAlign: 'center' }}>
                  {allComments.length || ''}
                </span>
              </div>

              {/* Post body */}
              <div style={{ flex: 1, padding: '14px 18px' }}>
                {/* Meta line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '1.5px', color: CAT_COLORS[p.category] || '#6b6055', padding: '2px 8px', borderRadius: 2, border: `1px solid ${CAT_COLORS[p.category] || '#6b6055'}22`, background: `${CAT_COLORS[p.category] || '#6b6055'}10` }}>
                    {p.category.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#2a2218' }}>
                    by <span style={{ color: '#4a4035' }}>{author}</span>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#1e1a16' }}>·</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#1e1a16' }}>{timeAgo}</span>
                  {allComments.length > 0 && (
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#2a2218' }}>
                      · {allComments.length} comment{allComments.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 6, color: isHovered ? '#f0e8dc' : '#e8e0d4', transition: 'color .2s' }}>
                  {p.title}
                </h3>

                {/* Content */}
                <p style={{
                  fontSize: 12, color: isHovered ? '#6b6055' : '#5a5047', lineHeight: 1.7, marginBottom: 12, transition: 'color .2s',
                  ...(isExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
                }}>
                  {p.content}
                </p>

                {/* Bottom bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.tags.map(t => (
                        <span key={t} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16', padding: '2px 6px', border: '1px solid #1a1510', borderRadius: 2 }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#1e1a16' }}>
                      {p.uses.toLocaleString()} uses
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#d4a96a' }}>
                      ★ {p.rating}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: p.trend > 0 ? '#10b981' : '#ef4444' }}>
                      {p.trend > 0 ? '↑' : '↓'}{Math.abs(p.trend)}%
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={(e) => handleCopy(e, p.content, p.id)}
                        style={copyBtn}
                      >
                        {copiedId === p.id ? 'COPIED' : 'COPY'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onLoadPrompt(p.content); }}
                        style={enhanceBtn}
                      >
                        TRY IN ENHANCE →
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments section */}
                {isExpanded && (allComments.length > 0 || commentingId === p.id) && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1a1510' }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '2px', color: '#3a3228', marginBottom: 10 }}>
                      COMMENTS {allComments.length > 0 && `(${allComments.length})`}
                    </div>
                    {allComments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: commentingId === p.id ? 12 : 0 }}>
                        {allComments.map((c, i) => (
                          <div key={i} style={{ paddingLeft: 12, borderLeft: `2px solid ${c.author === 'you' ? '#d4a96a33' : '#1e1a16'}` }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: c.author === 'you' ? '#d4a96a' : '#4a4035', fontWeight: 700 }}>{c.author}</span>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#1e1a16' }}>{c.time}</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#5a5047', lineHeight: 1.6 }}>{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {commentingId === p.id && (
                      <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') submitComment(e, p.id); }}
                          placeholder="Add a comment..."
                          autoFocus
                          style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1e1a16', borderRadius: 3, padding: '8px 12px', color: '#e8e0d4', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, outline: 'none', transition: 'border-color .2s' }}
                          onFocus={(e) => (e.target.style.borderColor = '#d4a96a')}
                          onBlur={(e) => (e.target.style.borderColor = '#1e1a16')}
                        />
                        <button
                          onClick={(e) => submitComment(e, p.id)}
                          disabled={!commentText.trim()}
                          style={{ background: commentText.trim() ? '#d4a96a' : '#1a1510', border: 'none', borderRadius: 3, padding: '8px 16px', color: commentText.trim() ? '#0a0a0a' : '#2a2218', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '1px', cursor: commentText.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}
                        >
                          POST
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Styles
const searchStyle = { width: '100%', background: '#0d0d0d', border: '1px solid #1e1a16', borderRadius: 3, padding: '11px 16px', color: '#e8e0d4', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, marginBottom: 18, transition: 'border-color .2s', outline: 'none' };
const voteBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '4px 6px', lineHeight: 1 };
const copyBtn = { background: 'none', border: '1px solid #d4a96a44', borderRadius: 3, padding: '6px 14px', color: '#d4a96a', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer', whiteSpace: 'nowrap' };
const enhanceBtn = { background: '#d4a96a', border: 'none', borderRadius: 3, padding: '6px 16px', color: '#0a0a0a', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '1.5px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' };
