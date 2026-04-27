#!/usr/bin/env node
/**
 * Email notification helper using Gmail.
 * Requires: GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_EMAIL env vars
 * Run: node scripts/notify.js "<subject>" "<body>"
 */

const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || GMAIL_USER;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

async function sendEmail(subject, body) {
  return transporter.sendMail({
    from: `Claude Trader <${GMAIL_USER}>`,
    to: NOTIFY_EMAIL,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>'),
  });
}

async function notifyTrade({ symbol, side, qty, price, reason }) {
  const emoji = side === 'buy' ? '🟢' : '🔴';
  const subject = `${emoji} ${side.toUpperCase()} ${qty} ${symbol} @ $${price}`;
  const body = [
    `Trade Executed`,
    ``,
    `Symbol: ${symbol}`,
    `Side: ${side.toUpperCase()}`,
    `Qty: ${qty}`,
    `Price: $${price}`,
    `Reason: ${reason}`,
    `Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`,
  ].join('\n');
  return sendEmail(subject, body);
}

async function notifyDailySummary({ date, pnl, trades, openPositions }) {
  const emoji = pnl >= 0 ? '📈' : '📉';
  const subject = `${emoji} Daily Summary ${date}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
  const body = [
    `Daily Trading Summary — ${date}`,
    ``,
    `P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
    `Trades Today: ${trades}`,
    `Open Positions: ${openPositions}`,
    `Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`,
  ].join('\n');
  return sendEmail(subject, body);
}

async function notifyWeeklySummary({ weekOf, totalPnl, winRate, bestTrade, worstTrade }) {
  const emoji = totalPnl >= 0 ? '📊' : '📉';
  const subject = `${emoji} Weekly Review ${weekOf}: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
  const body = [
    `Weekly Trading Review — ${weekOf}`,
    ``,
    `Total P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,
    `Win Rate: ${winRate}%`,
    `Best Trade: ${bestTrade}`,
    `Worst Trade: ${worstTrade}`,
  ].join('\n');
  return sendEmail(subject, body);
}

async function notifyAlert(message, urgent = false) {
  const subject = `${urgent ? '🚨' : '⚠️'} Trading Alert`;
  return sendEmail(subject, message);
}

// CLI
if (require.main === module) {
  const [, , subject, body] = process.argv;
  if (!subject) {
    console.log('Usage: node scripts/notify.js "<subject>" "<body>"');
    process.exit(0);
  }
  sendEmail(subject, body || '')
    .then(() => console.log('Email sent to', NOTIFY_EMAIL))
    .catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { sendEmail, notifyTrade, notifyDailySummary, notifyWeeklySummary, notifyAlert };
