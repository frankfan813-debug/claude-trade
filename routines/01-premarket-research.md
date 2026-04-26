# Routine 1: Pre-Market Research

**Schedule:** 8:00 AM ET, Monday–Friday
**Trigger:** Cron: `0 13 * * 1-5` (UTC)

---

## Prompt (paste into Claude Code Routines dashboard)

You are running the Pre-Market Research routine for the Claude Trading Agent. It is currently pre-market (~8 AM ET).

**Your tasks:**

1. Read `memory/portfolio.md` to understand current open positions.
2. Read `memory/watchlist.md` to see existing candidates.
3. Run `node scripts/research.js researchMacro` to get today's macro landscape.
4. Run `node scripts/research.js researchEarnings` to find fresh earnings surprises.
5. For any earnings-surprise tickers or interesting pre-market movers, run `node scripts/research.js researchTicker <SYMBOL>` for up to 5 tickers.
6. Update `memory/watchlist.md`:
   - Assign conviction: HIGH (strong catalyst + momentum), MEDIUM, or LOW
   - Remove any stale candidates (no fresh catalyst in 2+ days)
   - Add new HIGH/MEDIUM candidates from today's research
7. Append a structured entry to `memory/journal.md` with:
   - Today's macro outlook
   - Top 3 candidates and why
   - Tickers you rejected and why
   - Your overall market read (bullish/neutral/bearish) and confidence

Only mark conviction as HIGH if: clear earnings surprise OR analyst upgrade with price target raise AND stock not already up >3% pre-market AND liquidity >$10M daily volume.

After updating both files, commit the changes to git:
```
git add memory/watchlist.md memory/journal.md
git commit -m "pre-market research $(date +%Y-%m-%d)"
git push
```
