#!/usr/bin/env node
/**
 * ClickUp notification helper.
 * Run: node scripts/notify.js "<title>" "<description>"
 */

const TOKEN = process.env.CLICKUP_TOKEN;
const LIST_ID = process.env.CLICKUP_LIST_ID;

if (!TOKEN || !LIST_ID) {
  console.error('Missing CLICKUP_TOKEN or CLICKUP_LIST_ID environment variables');
  process.exit(1);
}

async function createTask(title, description, { priority = 3, tags = [] } = {}) {
  const res = await fetch(`https://api.clickup.com/api/v2/list/${LIST_ID}/task`, {
    method: 'POST',
    headers: {
      Authorization: TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: title,
      description,
      priority, // 1=urgent, 2=high, 3=normal, 4=low
      tags,
      due_date: Date.now(),
      due_date_time: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp error ${res.status}: ${text}`);
  }

  return res.json();
}

async function notifyTrade({ symbol, side, qty, price, reason }) {
  const emoji = side === 'buy' ? '🟢' : '🔴';
  const title = `${emoji} ${side.toUpperCase()} ${qty} ${symbol} @ $${price}`;
  const desc = `**Reason:** ${reason}\n**Time:** ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`;
  return createTask(title, desc, { priority: 2, tags: ['trade'] });
}

async function notifyDailySummary({ date, pnl, trades, openPositions }) {
  const emoji = pnl >= 0 ? '📈' : '📉';
  const title = `${emoji} Daily Summary ${date}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
  const desc = [
    `**P&L:** ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
    `**Trades Today:** ${trades}`,
    `**Open Positions:** ${openPositions}`,
    `**Generated:** ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`,
  ].join('\n');
  return createTask(title, desc, { priority: 3, tags: ['daily-summary'] });
}

async function notifyWeeklySummary({ weekOf, totalPnl, winRate, bestTrade, worstTrade }) {
  const emoji = totalPnl >= 0 ? '📊' : '📉';
  const title = `${emoji} Weekly Review ${weekOf}: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
  const desc = [
    `**Total P&L:** ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,
    `**Win Rate:** ${winRate}%`,
    `**Best Trade:** ${bestTrade}`,
    `**Worst Trade:** ${worstTrade}`,
  ].join('\n');
  return createTask(title, desc, { priority: 3, tags: ['weekly-review'] });
}

async function notifyAlert(message, urgent = false) {
  return createTask(
    `⚠️ Trading Alert: ${message.slice(0, 60)}`,
    message,
    { priority: urgent ? 1 : 2, tags: ['alert'] }
  );
}

// CLI
if (require.main === module) {
  const [, , title, description] = process.argv;
  if (!title) {
    console.log('Usage: node scripts/notify.js "<title>" "<description>"');
    process.exit(0);
  }
  createTask(title, description || '')
    .then(r => console.log('Created task:', r.id, r.url))
    .catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { createTask, notifyTrade, notifyDailySummary, notifyWeeklySummary, notifyAlert };
