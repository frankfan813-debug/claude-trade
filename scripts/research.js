#!/usr/bin/env node
/**
 * Market research via Perplexity API.
 * Run: node scripts/research.js "<query>"
 */

const KEY = process.env.PERPLEXITY_KEY;

if (!KEY) {
  console.error('Missing PERPLEXITY_KEY environment variable');
  process.exit(1);
}

async function search(query, { focusDate = null, recency = 'day' } = {}) {
  const messages = [
    {
      role: 'system',
      content: `You are a financial research assistant. Provide concise, factual market intelligence. Focus on: earnings surprises, analyst rating changes, price targets, sector trends, macro catalysts. Always cite sources. Today's date: ${new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })}.`,
    },
    { role: 'user', content: query },
  ];

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages,
      search_recency_filter: recency,
      return_citations: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Perplexity error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    citations: data.citations || [],
  };
}

async function researchTicker(symbol) {
  return search(
    `Research ${symbol} stock: latest earnings, analyst ratings, price targets, recent news, technical setup (52-week range, momentum). Is this a good swing trade opportunity right now? Give conviction: LOW, MEDIUM, or HIGH.`
  );
}

async function researchMacro() {
  return search(
    'What are the key market-moving events today? Include: Fed speakers, economic data releases, major earnings, sector rotation signals, pre-market movers in S&P 500 and Nasdaq-100.'
  );
}

async function researchSector(sector) {
  return search(`What is the outlook for the ${sector} sector today? Key catalysts, leading/lagging stocks, ETF flows.`);
}

async function researchEarnings() {
  return search(
    "Which S&P 500 or Nasdaq-100 companies reported earnings in the last 24 hours with a positive surprise? List ticker, surprise %, and whether the stock is up or down pre-market."
  );
}

// CLI
if (require.main === module) {
  const [, , command, ...rest] = process.argv;
  const commands = { search, researchTicker, researchMacro, researchSector, researchEarnings };

  if (!command || !commands[command]) {
    console.log('Available commands:', Object.keys(commands).join(', '));
    process.exit(0);
  }

  commands[command](...rest)
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { search, researchTicker, researchMacro, researchSector, researchEarnings };
