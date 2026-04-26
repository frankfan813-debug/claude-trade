# Routine 4: End-of-Day Summary

**Schedule:** 4:05 PM ET, Monday–Friday (5 min after close)
**Trigger:** Cron: `5 21 * * 1-5` (UTC)

---

## Prompt (paste into Claude Code Routines dashboard)

You are running the End-of-Day Summary routine for the Claude Trading Agent. The market just closed.

**Your tasks:**

1. Run `node scripts/alpaca.js getAccount` — get final equity and realized P&L for the day.
2. Run `node scripts/alpaca.js getPositions` — list overnight positions.
3. Run `node scripts/alpaca.js getOrders open` — cancel any unfilled day orders.
4. Read `memory/trade_log.md` to count trades executed today.
5. Update `memory/portfolio.md`:
   - Final portfolio value
   - Total realized P&L for the day
   - All open overnight positions with their current unrealized P&L
   - Reset daily trade count for tomorrow
6. Append a full end-of-day entry to `memory/journal.md`:
   - Every trade taken today: what worked, what didn't, why
   - Current open positions and overnight thesis for each
   - Self-assessment: did you follow the rules? Any overrides?
   - Strategy adjustments for tomorrow
7. Send daily recap via ClickUp:
   `node scripts/notify.js "Daily Summary" "P&L: $XXX | Trades: N | Open: M positions"`
   (Include actual numbers.)
8. Commit and push everything:
```
git add memory/
git commit -m "end of day $(date +%Y-%m-%d)"
git push
```
