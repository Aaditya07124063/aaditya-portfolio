# Trading Lab case-study copy

Route: `/projects/trading-lab`. Sources: the 19 August 2026 engineering snapshot in `TRADING_LAB(1).md` and the 29 October 2026 consolidation in `PROJECT_PORTFOLIO_FOCUSED.md`. No financial guidance or current market-rule claims are needed.

## Public copy

<!-- public-copy:start -->

# Trading Lab

A Python workbench that tests trading rules against a buy-and-hold benchmark, with execution timing and costs built into the evaluation.

Active research. This page covers two stages. The first is a daily-bar engine, described in an engineering snapshot dated August 2026. The second is a later opening-range breakout protocol, which was still a draft in the most recent record.

## The question is whether the idea beats holding

A trading rule can make money in a rising market and still lose to buying the asset and waiting. Trading Lab asks that question first. The engine computes the buy-and-hold benchmark in the same function that scores the strategy, over the same dates and with the same starting money, so a strategy return never appears without its comparison. The leaderboard sorts by margin over the benchmark instead of raw return, because a strong stock makes almost any rule's raw return look impressive.

The engine loads prices with pandas, adds moving-average indicators, turns them into a position that is either fully invested or in cash, simulates the trades, and scores the result. A FastAPI server and a one-page web interface sit on top for running experiments. Runs from the web interface are appended to a leaderboard, so a failed idea stays on the record.

## Keeping the decision apart from the fill

The simulator is a bar-by-bar loop instead of a vectorized expression. That's slower, but it makes the gap between deciding and trading part of the structure rather than something to remember. The position used on any day is the one computed from the previous day's close, and the order fills at the next open. Deciding on a close and filling at that same close is the easiest way for a backtest to flatter itself.

The engine charges a cost on every fill. It uses one blended figure of 0.10% per side for brokerage, charges, and slippage. That's cruder than an itemized model, but it doesn't claim precision the data can't support. Stops are checked at the close and filled at the next open, so an overnight gap stays in the result. Positions are all in or all out because the thing under test is timing, and position sizing would blur the answer.

## One evaluator for different ideas

The scoring code doesn't know what produced a position. A moving-average crossover and a random-forest direction model both write a position column and go through the same evaluator, so the model gets no softer treatment than the crossover.

The machine-learning experiment trains once on the first 70% of the history and tests on the last 30%. That's a chronological holdout. It's a reasonable first step, but it isn't walk-forward validation, and the snapshot points out that the README and the script's docstring both use that term for it. The snapshot reports that the model's accuracy barely cleared a naive always-up baseline and that the resulting trades lost to buy and hold. It takes that result from the README and does not re-run it. If the result holds, it shows that a small edge in predicting direction doesn't survive a cost on every round trip.

## What the August snapshot found

The strategy the lab rated best was an EMA 20/50 crossover on ten years of Nifty 50 data. Its margin over buy and hold was small and positive, and it turned negative when the assumed cost rose from 0.10% to 0.15% per side. The snapshot interprets this sensitivity as a reason to distrust the small measured edge. The result depends on the cost assumption.

A parameter sweep made the same point from another side. Of 36 fast and slow average combinations, four beat the benchmark. One of the highest-scoring pairs, 25/50, sat between two pairs that lost badly. That uneven pattern raises an overfitting concern; it does not prove that the strategy was overfit. The lab reported the standard 20/50 pair rather than the best cell in the grid. That was the right call, though nothing in the code enforces it.

A trailing-stop test went against intuition. A 5% trailing stop cut the return roughly in half and made the worst drawdown slightly worse, because it sold good trades during ordinary pullbacks.

The snapshot also lists problems in the measurement itself. The benchmark is invested while a slow indicator is still warming up and the strategy is forced to sit in cash, which penalizes slow indicators for a mechanical reason. Two scripts write the leaderboard under different rules, so running the batch script erases results added through the web interface. And some real-world effects sit outside the model. Dividends and taxes are left out, which favors the strategy. Interest on idle cash is also left out, which favors the benchmark.

The paper-trading bot is the piece closest to real money, and it's the least proven. In the snapshot it had run once, written a single diary line, and filled no orders. It could also execute a stale pending order after a missed run. Its existence says nothing about a forward record yet.

## The later research protocol

The October 2026 project record moves from the daily engine toward a more formal study of opening-range breakouts on Indian equities. It adds a dataset registry that records checksums, retrieval dates, time zones, and price basis, along with methodology, reproducibility, and research-log documents. The universe is frozen to the Nifty 50 constituents, and the data now includes 15-minute and hourly bars.

The protocol is careful about what it hasn't decided. It lists candidate exit rules without choosing one, because the choice affects every result and shouldn't be made before the protocol is validated. A holdout boundary at 1 October 2026 is meant to stay out of any tuning. The record notes missing late-session bars in its main price source, which matters when the exit time is the question, and it says the intraday cost model hadn't had all its rates filled in at the last audit. It also considers null-centred statistical tests, such as a block bootstrap or a sign-flip test, along with power calculations and a correction for testing many variants.

ORB v1 is still marked as a draft. The next stage hasn't started in that record, and no return from it counts as a result.

## What would settle it

A reproducible experiment tied to a dataset version, a code revision, a complete cost model, and a fixed protocol would turn a number into a result. A longer paper-trading record would answer a different question, which is whether the process behaves as expected as new data arrives.

[Next project: Pancreatic CT research](/projects/pancreatic-ct) · [All projects](/projects)

<!-- public-copy:end -->

## Claim boundaries

Editorial. Do not publish this section.

| Public statement | Source basis | Do not say |
|---|---|---|
| Benchmark computed beside the strategy, next-open fills, 0.10% per side, close-checked stops | Snapshot sections 3, 10, 11 | That the model covers live trading, taxes, or liquidity |
| EMA 20/50 margin small and positive, negative at 0.15% | Snapshot section 21.1 | Any return, margin, or drawdown percentage |
| Four of 36 sweep cells beat the benchmark; 25/50 between two losing pairs | Snapshot section 21.2 | That the sweep proves overfitting, or that a "best cell" exists to use |
| 5% trailing stop roughly halved the return and slightly worsened the worst fall | Snapshot section 10.3 | Exact figures |
| Single 70/30 chronological holdout, README figures not re-run | Snapshot sections 14.2, 19, F-3 | "Walk-forward", or the ML accuracy and return figures |
| Paper bot: one run, one diary line, no fills, stale-order defect | Snapshot sections 16, F-4 | Any forward performance or "validated" paper trading |
| ORB v1 is a draft, Stage 2 not started, holdout boundary 1 October 2026 | Consolidation sections 3.9, 11 | That the holdout was evaluated, or any ORB return |

Left out on purpose. The snapshot's "39% drawdown reduction" does not match its own displayed 38.4% and 15.1%. Its rounded returns of 184.8% and 181.6% differ by 3.2 points while the table reports 3.1, so no margin figure appears above. The consolidation's 22% missing-bar rate, closing-auction dates, broker cutoffs, and the critique of a named SSRN paper are unverified secondary claims and were generalized or dropped. Test counts (67, 80, 18 commits) are historical milestones. The snapshot was written before the consolidation, so the later record neither confirms nor retires the earlier defects.

## Asset and publication notes

Use a pipeline diagram first. Publish an equity chart only with its dataset, date range, strategy, benchmark, costs, and known limitations. Do not reuse the source's inconsistent derived drawdown percentage or rounded excess-return margin. Historical test-count milestones do not belong in permanent homepage copy.
