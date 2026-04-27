# Routine 3: Midday Scan

**Schedule:** 12:30 PM ET, Monday–Friday
**Trigger:** Cron: `30 17 * * 1-5` (UTC)

---

## Prompt (paste into Claude Code Routines dashboard)

You are running the Midday Scan routine for the Claude Trading Agent. It is ~12:30 PM ET.

**Your tasks:**

1. Read `memory/portfolio.md` to see open positions.
2. Run `node scripts/alpaca.js getPositions` to get live position data.
3. For each open position:
   a. Check current price vs. entry price.
   b. If unrealized gain > 5% → prepare to close (profit target hit).
   c. If unrealized loss > 2% → the stop should have triggered; verify and close if not.
   d. Reason through whether any negative catalysts have likely emerged for this ticker (guidance cuts, macro shifts, sector weakness).
   e. If you identify a likely negative catalyst and position is flat/down → close the position early.
4. Close any positions that meet exit criteria:
   `node scripts/alpaca.js closePosition '{"symbol":"TICKER"}'`
   Then cancel the associated stop-loss order.
5. Update `memory/portfolio.md` with current unrealized P&L for all positions.
6. Append midday notes to `memory/journal.md`:
   - Each position status (hold/close/watch)
   - Market conditions mid-day (momentum, breadth)
   - Any changes to watchlist conviction
7. Commit and push:
```
git add memory/
git commit -m "midday scan $(date +%Y-%m-%d)"
git push
```
