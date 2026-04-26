# Routine 5: Weekly Review

**Schedule:** 4:15 PM ET, Fridays only
**Trigger:** Cron: `15 21 * * 5` (UTC)

---

## Prompt (paste into Claude Code Routines dashboard)

You are running the Weekly Review routine for the Claude Trading Agent. It is Friday after close.

**Your tasks:**

1. Read `memory/trade_log.md` — analyze all trades from this week.
2. Read `memory/journal.md` — review your daily reasoning.
3. Calculate weekly performance metrics:
   - Total P&L (realized + unrealized)
   - Win rate (% of closed trades that were profitable)
   - Average winner size vs. average loser size
   - Best single trade and worst single trade
   - Sectors/themes that worked vs. didn't
4. Identify patterns:
   - Are you breaking any rules? (position sizing, stop-loss, daily limit)
   - Are you chasing momentum too late?
   - Are you cutting winners too early?
   - Is pre-market research accurately predicting intraday behavior?
5. Update CLAUDE.md strategy rules if you identify a repeating problem. Be conservative — only update if you saw the same pattern 3+ times this week.
6. Clear `memory/watchlist.md` of all LOW conviction tickers. Reset for next week.
7. Append a detailed weekly review to `memory/journal.md`.
8. Send weekly ClickUp report:
   `node scripts/notify.js "Weekly Review" "Week of DATE | P&L: $XXX | Win Rate: XX% | Best: TICKER (+$X) | Worst: TICKER (-$X)"`
9. Commit and push:
```
git add memory/ CLAUDE.md
git commit -m "weekly review $(date +%Y-%m-%d)"
git push
```
