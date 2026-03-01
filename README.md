# PromptSage ✦

> Compile your prompt. Eliminate hallucinations.

A prompt engineering tool that scores, annotates, and enhances any LLM prompt using Claude. Paste a rough prompt and get back a production-ready version with hallucination risk analysis, specificity scoring, and a tagged changelog explaining every improvement.

---

## Features

- **Score & Enhance** — Before/after quality scores (0–100) with visual ring gauges
- **Hallucination Risk** — LOW / MED / HIGH / CRITICAL rating per prompt
- **Diff View** — Side-by-side comparison with risky phrases (red) and injected improvements (cyan) highlighted
- **Change Log** — FIX / WARN / INJECT tags explaining what changed and why
- **Context & Constraints** — Optional fields for environment context and preservation rules
- **Browse Library** — Community prompt templates across 6 categories, loadable into the enhancer

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your API key
cp .env.example .env
# Edit .env and add your Anthropic API key

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
promptsage/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Root layout + nav
    ├── api.js            # Anthropic API call
    ├── constants.js      # Library data, color maps
    ├── utils/
    │   └── diff.js       # HTML diff builder
    └── components/
        ├── ScoreRing.jsx   # SVG score gauge
        ├── EnhanceView.jsx # Main enhance tab
        └── BrowseView.jsx  # Browse tab
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |

> **Note:** This app calls the Anthropic API directly from the browser using the `anthropic-dangerous-direct-browser-access` header. For production, route calls through a backend to keep your API key secret.

---

## Build for Production

```bash
npm run build
# Output in /dist
```

---

## Tech Stack

- **React 18** + Vite
- **Anthropic Claude** (claude-sonnet-4) via direct API
- **Playfair Display** + **JetBrains Mono** (Google Fonts)
- Zero external UI libraries — pure inline styles
