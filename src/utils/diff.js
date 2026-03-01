/**
 * Builds side-by-side diff HTML for original vs enhanced prompt.
 * - Risky phrases highlighted in red
 * - New words (not in original) highlighted in cyan
 */
export function buildDiff(original, enhanced, riskyPhrases = []) {
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Highlight risky phrases in original
  let origHtml = esc(original);
  riskyPhrases.forEach((phrase) => {
    if (!phrase) return;
    const ep = esc(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    origHtml = origHtml.replace(
      new RegExp(ep, 'gi'),
      (m) => `<mark class="risky">${m}</mark>`
    );
  });

  // Highlight new words in enhanced
  const origWords = new Set(original.toLowerCase().split(/\s+/));
  const enhHtml = esc(enhanced).replace(
    /\b(\w{4,})\b/g,
    (w) => (!origWords.has(w.toLowerCase()) ? `<mark class="added">${w}</mark>` : w)
  );

  return { origHtml, enhHtml };
}
