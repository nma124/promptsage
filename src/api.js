const SYSTEM_PROMPT = `You are an expert prompt engineer. Analyze and enhance the given prompt.

You MUST respond with a JSON object in exactly this format (no extra keys, no markdown):
{
  "enhanced": "the improved prompt text as a string",
  "score_before": <number 0-100 rating the original prompt>,
  "score_after": <number 0-100 rating the enhanced prompt>,
  "hallucination_risk": "<one of: low, medium, high>",
  "specificity_after": <number 0-100>,
  "summary": "one-sentence summary of improvements made",
  "risky_phrases": ["phrase1", "phrase2"],
  "changes": [
    { "tag": "<one of: CLARITY, STRUCTURE, GUARDRAILS, SPECIFICITY, CONTEXT, TONE>", "description": "what changed and why" }
  ]
}

Guidelines:
- Rewrite the prompt to be clearer, more specific, and less prone to hallucination.
- Preserve the user's intent and any preservation constraints.
- Identify risky/vague phrases in the original that could cause hallucination.
- Score honestly — most raw prompts score 20-50, enhanced ones 70-90.`;

export async function callEnhanceAPI(rawPrompt, context, preservation) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_GOOGLE_API_KEY in .env');

  const userContent = `${SYSTEM_PROMPT}\n\nEnhance this prompt:\n\n${rawPrompt}${context ? `\n\nContext: ${context}` : ''}${preservation ? `\n\nMust NOT change: ${preservation}` : ''}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userContent }] }],
        generationConfig: { maxOutputTokens: 1500, responseMimeType: 'application/json' },
      }),
    }
  );

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(text);
}
