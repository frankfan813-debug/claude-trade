#!/usr/bin/env node
/**
 * Alpaca API wrapper. Run standalone: node scripts/alpaca.js <method> [jsonArgs]
 * Methods: getAccount, getPositions, getOrders, getQuote, placeOrder, closePosition, cancelOrder
 */

const BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
const DATA_URL = 'https://data.alpaca.markets'; // market data always uses this host
const KEY = process.env.ALPACA_KEY;
const SECRET = process.env.ALPACA_SECRET;

if (!KEY || !SECRET) {
  console.error('Missing ALPACA_KEY or ALPACA_SECRET environment variables');
  process.exit(1);
}

const headers = {
  'APCA-API-KEY-ID': KEY,
  'APCA-API-SECRET-KEY': SECRET,
  'Content-Type': 'application/json',
};

async function request(method, path, body = null, baseUrl = BASE_URL) {
  const url = `${baseUrl}${path}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`Alpaca ${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function getAccount() {
  return request('GET', '/v2/account');
}

async function getPositions() {
  return request('GET', '/v2/positions');
}

async function getOrders(status = 'open') {
  return request('GET', `/v2/orders?status=${status}&limit=50`);
}

async function getQuote(symbol) {
  const data = await request('GET', `/v2/stocks/${symbol}/quotes/latest`, null, DATA_URL);
  return data.quote;
}

async function getLatestBar(symbol) {
  const data = await request('GET', `/v2/stocks/${symbol}/bars/latest`, null, DATA_URL);
  return data.bar;
}

async function placeOrder({ symbol, qty, side, type = 'market', stopPrice = null, notional = null }) {
  const body = {
    symbol,
    side,
    type,
    time_in_force: type === 'market' ? 'day' : 'gtc',
  };
  if (notional && !qty) {
    body.notional = notional.toFixed(2);
  } else {
    body.qty = qty;
  }
  if (stopPrice) {
    body.stop_price = stopPrice.toFixed(2);
  }
  return request('POST', '/v2/orders', body);
}

async function placeOrderWithStop({ symbol, qty, entryPrice }) {
  const stopPrice = entryPrice * 0.98; // 2% stop-loss per strategy rules
  const buyOrder = await placeOrder({ symbol, qty, side: 'buy', type: 'market' });
  // Place stop-loss as a separate stop order
  const stopOrder = await placeOrder({
    symbol,
    qty,
    side: 'sell',
    type: 'stop',
    stopPrice,
  });
  return { buyOrder, stopOrder };
}

async function closePosition(symbol) {
  return request('DELETE', `/v2/positions/${symbol}`);
}

async function cancelOrder(orderId) {
  return request('DELETE', `/v2/orders/${orderId}`);
}

async function isMarketOpen() {
  const clock = await request('GET', '/v2/clock');
  return clock.is_open;
}

async function getPortfolioHistory(period = '1D') {
  return request('GET', `/v2/account/portfolio/history?period=${period}&timeframe=1H`);
}

// CLI interface
const METHODS = {
  getAccount, getPositions, getOrders, getQuote, getLatestBar,
  placeOrder, placeOrderWithStop, closePosition, cancelOrder,
  isMarketOpen, getPortfolioHistory,
};

if (require.main === module) {
  const [, , method, argsJson] = process.argv;
  if (!method || !METHODS[method]) {
    console.log('Available methods:', Object.keys(METHODS).join(', '));
    process.exit(0);
  }
  const args = argsJson ? JSON.parse(argsJson) : undefined;
  (Array.isArray(args) ? METHODS[method](...args) : METHODS[method](args))
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = {
  getAccount, getPositions, getOrders, getQuote, getLatestBar,
  placeOrder, placeOrderWithStop, closePosition, cancelOrder,
  isMarketOpen, getPortfolioHistory,
};
