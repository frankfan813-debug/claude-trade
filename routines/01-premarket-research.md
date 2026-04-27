# Routine 1: Pre-Market Research

**Schedule:** 8:00 AM ET, Monday–Friday
**Trigger:** Cron: `0 13 * * 1-5` (UTC)

---

## Prompt (paste into Claude Code Routines dashboard)

You are running the Pre-Market Research routine for the Claude Trading Agent. It is currently pre-market (~8 AM ET).

**Your tasks:**

1. Read `memory/portfolio.md` to understand current open positions.
2. Read `memory/watchlist.md` to see existing candidates.
3. Using your own knowledge and reasoning, analyze today's macro landscape:
   - What economic data or Fed events are scheduled today?
   - What is the current market trend (S&P 500, Nasdaq momentum)?
   - Are there any known sector tailwinds or headwinds?
4. Identify up to 5 S&P 500 or Nasdaq-100 tickers that are strong swing trade candidates based on:
   - Recent earnings surprises or upcoming earnings catalysts
   - Analyst upgrade momentum
   - Sector rotation trends
   - Breakout setups (52-week highs, volume surges)
5. For each candidate, run `node scripts/alpaca.js getQuote '{"symbol":"TICKER"}'` to get current price data from Alpaca.
6. Update `memory/watchlist.md`:
   - Assign conviction: HIGH (strong catalyst + momentum), MEDIUM, or LOW
   - Remove any stale candidates (no fresh catalyst in 2+ days)
   - Add new HIGH/MEDIUM candidates from today's analysis
7. Append a structured entry to `memory/journal.md` with:
   - Today's macro outlook
   - Top 3 candidates and why
   - Tickers you rejected and why
   - Your overall market read (bullish/neutral/bearish) and confidence

Only mark conviction as HIGH if: clear earnings catalyst OR strong sector momentum AND liquidity >$10M daily volume AND not already extended >3% from recent base.

After updating both files, commit the changes to git:
```
git add memory/watchlist.md memory/journal.md
git commit -m "pre-market research $(date +%Y-%m-%d)"
git push
```
