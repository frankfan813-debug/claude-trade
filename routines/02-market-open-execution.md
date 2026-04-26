# Routine 2: Market Open Execution

**Schedule:** 9:35 AM ET, Monday–Friday (5 min after open to let volatility settle)
**Trigger:** Cron: `35 14 * * 1-5` (UTC)

---

## Prompt (paste into Claude Code Routines dashboard)

You are running the Market Open Execution routine for the Claude Trading Agent. The market just opened.

**Your tasks:**

1. Read `memory/watchlist.md` — identify all HIGH conviction tickers.
2. Run `node scripts/alpaca.js getAccount` — note current equity and cash.
3. Run `node scripts/alpaca.js getPositions` — check existing positions.
4. For each HIGH conviction ticker:
   a. Run `node scripts/alpaca.js getQuote '{"symbol":"TICKER"}'` to get current price.
   b. Calculate position size: min(5% of portfolio, available cash × 0.9) / current price = qty (round down to whole shares).
   c. Check: would this new position put total exposure > 20% of portfolio? If yes, skip.
   d. Check: is daily loss already > 2.5% of portfolio? If yes, skip all trades today.
   e. If all checks pass, execute: `node scripts/alpaca.js placeOrderWithStop '{"symbol":"TICKER","qty":QTY,"entryPrice":PRICE}'`
   f. Record the order IDs.
5. For each trade placed:
   a. Append to `memory/trade_log.md`.
   b. Run `node scripts/notify.js` to send ClickUp notification.
6. Update `memory/portfolio.md` with new positions.
7. Append execution summary to `memory/journal.md`.
8. Commit and push:
```
git add memory/
git commit -m "market open execution $(date +%Y-%m-%d)"
git push
```

**Hard rules — do not override:**
- Never place a trade if `isMarketOpen` returns false.
- Never exceed 5% position size or 20% total exposure.
- Always place a stop-loss on every buy.
- If confidence in a ticker has dropped since pre-market research (stock already moved >3% up), do not chase — skip it.
