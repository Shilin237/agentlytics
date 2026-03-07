// Model pricing per million tokens (USD)
// Sources:
//   Anthropic: platform.claude.com/docs/en/about-claude/pricing
//   OpenAI:    developers.openai.com/api/docs/pricing
//   Google:    ai.google.dev/pricing
//   xAI:       docs.x.ai/docs/models
//   DeepSeek:  api-docs.deepseek.com/quick_start/pricing
// Last verified: 2026-03
//
// cacheRead  = cache hit price (Anthropic: 0.1x input, OpenAI: varies)
// cacheWrite = 5-minute cache write price (Anthropic: 1.25x input, OpenAI: same as input)
const MODEL_PRICING = {
  // ── Anthropic ─────────────────────────────────────────────────
  // Claude 4.6
  'claude-opus-4-6':            { input: 5,    output: 25,   cacheRead: 0.50,  cacheWrite: 6.25  },
  'claude-sonnet-4-6':          { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  // Claude 4.5
  'claude-opus-4-5':            { input: 5,    output: 25,   cacheRead: 0.50,  cacheWrite: 6.25  },
  'claude-sonnet-4-5':          { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  'claude-haiku-4-5':           { input: 1,    output: 5,    cacheRead: 0.10,  cacheWrite: 1.25  },
  // Claude 4.1 / 4.0
  'claude-opus-4-1':            { input: 15,   output: 75,   cacheRead: 1.50,  cacheWrite: 18.75 },
  'claude-opus-4-0':            { input: 15,   output: 75,   cacheRead: 1.50,  cacheWrite: 18.75 },
  'claude-sonnet-4-0':          { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  'claude-sonnet-4':            { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  // Claude 3.7 / 3.5
  'claude-sonnet-3-7':          { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  'claude-3-5-sonnet':          { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  'claude-3-5-haiku':           { input: 0.80, output: 4,    cacheRead: 0.08,  cacheWrite: 1     },
  // Claude 3
  'claude-3-opus':              { input: 15,   output: 75,   cacheRead: 1.50,  cacheWrite: 18.75 },
  'claude-3-sonnet':            { input: 3,    output: 15,   cacheRead: 0.30,  cacheWrite: 3.75  },
  'claude-3-haiku':             { input: 0.25, output: 1.25, cacheRead: 0.03,  cacheWrite: 0.30  },

  // ── OpenAI ────────────────────────────────────────────────────
  // GPT-5.x
  'gpt-5.4':                    { input: 2.50, output: 15,   cacheRead: 0.25,  cacheWrite: 2.50  },
  'gpt-5.4-pro':                { input: 30,   output: 180,  cacheRead: 30,    cacheWrite: 30    },
  'gpt-5.2':                    { input: 1.75, output: 14,   cacheRead: 0.175, cacheWrite: 1.75  },
  'gpt-5.2-pro':                { input: 21,   output: 168,  cacheRead: 21,    cacheWrite: 21    },
  'gpt-5.1':                    { input: 1.25, output: 10,   cacheRead: 0.125, cacheWrite: 1.25  },
  'gpt-5':                      { input: 1.25, output: 10,   cacheRead: 0.125, cacheWrite: 1.25  },
  'gpt-5-mini':                 { input: 0.25, output: 2,    cacheRead: 0.025, cacheWrite: 0.25  },
  'gpt-5-nano':                 { input: 0.05, output: 0.40, cacheRead: 0.005, cacheWrite: 0.05  },
  'gpt-5-pro':                  { input: 15,   output: 120,  cacheRead: 15,    cacheWrite: 15    },
  // Codex
  'gpt-5.3-codex':              { input: 1.75, output: 14,   cacheRead: 0.175, cacheWrite: 1.75  },
  'gpt-5.2-codex':              { input: 1.75, output: 14,   cacheRead: 0.175, cacheWrite: 1.75  },
  'gpt-5.1-codex-max':          { input: 1.25, output: 10,   cacheRead: 0.125, cacheWrite: 1.25  },
  'gpt-5.1-codex':              { input: 1.25, output: 10,   cacheRead: 0.125, cacheWrite: 1.25  },
  'gpt-5-codex':                { input: 1.25, output: 10,   cacheRead: 0.125, cacheWrite: 1.25  },
  'codex-mini':                 { input: 1.50, output: 6,    cacheRead: 0.375, cacheWrite: 1.50  },
  // GPT-4.x
  'gpt-4.1':                    { input: 2,    output: 8,    cacheRead: 0.50,  cacheWrite: 2     },
  'gpt-4.1-mini':               { input: 0.40, output: 1.60, cacheRead: 0.10,  cacheWrite: 0.40  },
  'gpt-4.1-nano':               { input: 0.10, output: 0.40, cacheRead: 0.025, cacheWrite: 0.10  },
  'gpt-4o':                     { input: 2.50, output: 10,   cacheRead: 1.25,  cacheWrite: 2.50  },
  'gpt-4o-mini':                { input: 0.15, output: 0.60, cacheRead: 0.075, cacheWrite: 0.15  },
  'gpt-4-turbo':                { input: 10,   output: 30,   cacheRead: 10,    cacheWrite: 10    },
  'gpt-4':                      { input: 30,   output: 60,   cacheRead: 30,    cacheWrite: 30    },
  'gpt-3.5-turbo':              { input: 0.50, output: 1.50, cacheRead: 0.50,  cacheWrite: 0.50  },
  // o-series
  'o1':                         { input: 15,   output: 60,   cacheRead: 7.50,  cacheWrite: 15    },
  'o1-mini':                    { input: 1.10, output: 4.40, cacheRead: 0.55,  cacheWrite: 1.10  },
  'o1-pro':                     { input: 150,  output: 600,  cacheRead: 150,   cacheWrite: 150   },
  'o3':                         { input: 2,    output: 8,    cacheRead: 0.50,  cacheWrite: 2     },
  'o3-pro':                     { input: 20,   output: 80,   cacheRead: 20,    cacheWrite: 20    },
  'o3-mini':                    { input: 1.10, output: 4.40, cacheRead: 0.55,  cacheWrite: 1.10  },
  'o4-mini':                    { input: 1.10, output: 4.40, cacheRead: 0.275, cacheWrite: 1.10  },

  // ── Google Gemini ─────────────────────────────────────────────
  'gemini-3.1-pro':             { input: 2,    output: 12,   cacheRead: 0.20,  cacheWrite: 2     },
  'gemini-3-pro':               { input: 2,    output: 12,   cacheRead: 0.20,  cacheWrite: 2     },
  'gemini-3-flash':             { input: 0.50, output: 3,    cacheRead: 0.05,  cacheWrite: 0.50  },
  'gemini-3.1-flash-lite':      { input: 0.25, output: 1.50, cacheRead: 0.025, cacheWrite: 0.25  },
  'gemini-2.5-pro':             { input: 1.25, output: 10,   cacheRead: 0.125, cacheWrite: 1.25  },
  'gemini-2.5-flash':           { input: 0.30, output: 2.50, cacheRead: 0.03,  cacheWrite: 0.30  },
  'gemini-2.5-flash-lite':      { input: 0.10, output: 0.40, cacheRead: 0.01,  cacheWrite: 0.10  },
  'gemini-2.0-flash':           { input: 0.10, output: 0.40, cacheRead: 0.025, cacheWrite: 0.10  },
  'gemini-2.0-flash-lite':      { input: 0.075,output: 0.30, cacheRead: 0.075, cacheWrite: 0.075 },
  'gemini-1.5-pro':             { input: 1.25, output: 5,    cacheRead: 0.315, cacheWrite: 1.25  },
  'gemini-1.5-flash':           { input: 0.075,output: 0.30, cacheRead: 0.019, cacheWrite: 0.075 },

  // ── xAI ───────────────────────────────────────────────────────
  'grok-4':                     { input: 3,    output: 15,   cacheRead: 0.75,  cacheWrite: 3     },
  'grok-4-fast':                { input: 0.20, output: 0.50, cacheRead: 0.05,  cacheWrite: 0.20  },
  'grok-code-fast-1':           { input: 0.20, output: 1.50, cacheRead: 0.02,  cacheWrite: 0.20  },
  'grok-3':                     { input: 3,    output: 15,   cacheRead: 0.75,  cacheWrite: 3     },
  'grok-3-mini':                { input: 0.30, output: 0.50, cacheRead: 0.07,  cacheWrite: 0.30  },

  // ── DeepSeek ──────────────────────────────────────────────────
  'deepseek-chat':              { input: 0.28, output: 0.42, cacheRead: 0.028, cacheWrite: 0.28  },
  'deepseek-reasoner':          { input: 0.28, output: 0.42, cacheRead: 0.028, cacheWrite: 0.28  },
};

// Normalize a model identifier to match pricing keys
// Handles versioned names like "claude-sonnet-4-20250514", "gpt-4o-2024-08-06", etc.
function normalizeModelName(name) {
  if (!name) return null;
  let n = name.toLowerCase().trim();

  // Strip leading provider prefixes (e.g. "anthropic/claude-..." or "openai/gpt-...")
  const slashIdx = n.lastIndexOf('/');
  if (slashIdx !== -1) n = n.substring(slashIdx + 1);

  // Direct match first
  if (MODEL_PRICING[n]) return n;

  // Try stripping date suffixes like -20250514, -2024-08-06
  const withoutDate = n.replace(/-\d{4}-?\d{2}-?\d{2}$/, '');
  if (MODEL_PRICING[withoutDate]) return withoutDate;

  // Try stripping :latest or similar tags
  const withoutTag = n.replace(/:(latest|thinking)$/, '');
  if (MODEL_PRICING[withoutTag]) return withoutTag;

  // Fuzzy matching: check if model name starts with a known key
  for (const key of Object.keys(MODEL_PRICING)) {
    if (n.startsWith(key)) return key;
  }

  return null;
}

function getModelPricing(modelName) {
  const key = normalizeModelName(modelName);
  return key ? MODEL_PRICING[key] : null;
}

// Calculate cost for a set of token counts and a model
// Returns cost in USD or null if model is unknown
function calculateCost(modelName, inputTokens, outputTokens, cacheRead, cacheWrite) {
  const pricing = getModelPricing(modelName);
  if (!pricing) return null;

  const input = ((inputTokens || 0) / 1_000_000) * pricing.input;
  const output = ((outputTokens || 0) / 1_000_000) * pricing.output;
  const cr = ((cacheRead || 0) / 1_000_000) * pricing.cacheRead;
  const cw = ((cacheWrite || 0) / 1_000_000) * pricing.cacheWrite;

  return input + output + cr + cw;
}

module.exports = { MODEL_PRICING, normalizeModelName, getModelPricing, calculateCost };
