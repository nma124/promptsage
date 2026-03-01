const STORAGE_KEY = "promptsage_sessions";

export function saveSession(raw, result) {
  const sessions = getSessions();
  sessions.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    score_before: result.score_before,
    score_after: result.score_after,
    hallucination_risk: result.hallucination_risk,
    risky_phrases: result.risky_phrases,
    change_tags: result.changes.map(c => c.tag),
    word_count: raw.trim().split(/\s+/).filter(Boolean).length,
    tokens: Math.ceil(raw.length / 4),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}
