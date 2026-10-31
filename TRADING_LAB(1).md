# Trading Lab — Engineering & Design Document

> A complete technical account of this repository: what every component does,
> **how** it does it, and **why** it was built that way — including the decisions
> that were made deliberately, the ones that were made implicitly, and the
> consequences of both.

| | |
|---|---|
| **Project** | Trading Lab |
| **Purpose** | Honest backtesting, research and paper-trading platform for Indian markets |
| **Language** | Python 3.13 (bytecode on disk is `cpython-313`) + vanilla HTML/CSS/JS |
| **Size** | 687 lines of Python across 15 files, 670 lines of single-file web UI, 36 data CSVs (~28 MB) |
| **Repo state** | 61 tracked files, single commit `6ce8592 "Initial commit"`, branch `main` |
| **Document date** | 2026-08-19 |
| **Verification** | Every number in the "Verified results" sections below was re-executed against the live repository while writing this document |

---

## Table of contents

1. [How to read this document](#1-how-to-read-this-document)
2. [Executive summary](#2-executive-summary)
3. [The central thesis and why it shapes the code](#3-the-central-thesis-and-why-it-shapes-the-code)
4. [Repository map](#4-repository-map)
5. [Architecture](#5-architecture)
6. [Layer 1 — Configuration (`src/config.py`)](#6-layer-1--configuration-srcconfigpy)
7. [Layer 2 — Data loading (`src/data_loader.py`)](#7-layer-2--data-loading-srcdata_loaderpy)
8. [Layer 3 — Indicators (`src/indicators.py`)](#8-layer-3--indicators-srcindicatorspy)
9. [Layer 4 — Signals (`src/signals.py`)](#9-layer-4--signals-srcsignalspy)
10. [Layer 5 — The backtest engine (`src/backtest.py`)](#10-layer-5--the-backtest-engine-srcbacktestpy)
11. [Layer 6 — Metrics and the verdict system (`src/metrics.py`)](#11-layer-6--metrics-and-the-verdict-system-srcmetricspy)
12. [The data layer](#12-the-data-layer)
13. [Data acquisition (`fetch_data.py`)](#13-data-acquisition-fetch_datapy)
14. [Experiment runners](#14-experiment-runners)
15. [The web application](#15-the-web-application)
16. [The paper-trading bot (`paper_bot.py`)](#16-the-paper-trading-bot-paper_botpy)
17. [Results artifacts](#17-results-artifacts)
18. [Testing strategy](#18-testing-strategy)
19. [Reproducibility and environment](#19-reproducibility-and-environment)
20. [Verified results](#20-verified-results)
21. [Robustness evidence: cost sensitivity and parameter surface](#21-robustness-evidence-cost-sensitivity-and-parameter-surface)
22. [Senior engineering review — findings](#22-senior-engineering-review--findings)
23. [What the lab deliberately does not model](#23-what-the-lab-deliberately-does-not-model)
24. [Roadmap and sequencing rationale](#24-roadmap-and-sequencing-rationale)
25. [Glossary](#25-glossary)
26. [Appendix A — Exact reproduction commands](#appendix-a--exact-reproduction-commands)
27. [Appendix B — Working-tree state](#appendix-b--working-tree-state)

---

## 1. How to read this document

Each component section follows the same four-part shape, because the request behind
this document is "explain the *why* behind every decision", and a *why* is only
meaningful once the *what* and the *how* are pinned down:

- **What it does** — the contract in one or two sentences.
- **How it works** — the mechanism, with `file:line` references you can click.
- **Why it is built this way** — the decision, the alternatives that were available,
  and the reason this one was chosen.
- **Consequences and failure modes** — what this decision costs you, and what breaks.

Where a design decision looks accidental rather than deliberate, this document says
so plainly instead of inventing a rationale. Distinguishing *"this was chosen"* from
*"this happened"* is the most useful thing a design document can do for the person
who maintains the code six months later.

---

## 2. Executive summary

Trading Lab is a from-scratch research platform that answers one question about any
trading rule: **does it beat simply buying the asset and holding it, after costs?**

It is built as a strict five-stage pipeline — load → indicate → signal → backtest →
judge — where each stage is a pure-ish function over a pandas DataFrame, with a
single shared column contract. Around that core sit four consumers: a batch
experiment runner, a machine-learning experiment, a cross-sectional momentum
experiment, and a FastAPI + vanilla-JS web workbench. A fifth consumer, the paper
bot, runs the same strategy forward in time on live data with fake money.

The distinguishing property of the system is not the strategies — they are textbook
moving-average crossovers. It is the **discipline of the measurement**:

| Discipline | Where it lives | What it prevents |
|---|---|---|
| Signals form at close, execute at next open | [`src/backtest.py:25`](src/backtest.py#L25) | Look-ahead bias — the single most common backtest lie |
| 0.1% cost charged on every fill | [`src/backtest.py:32,45`](src/backtest.py#L32) | "Frictionless" strategies that vanish in reality |
| Every result reported against buy & hold | [`src/metrics.py:11-12`](src/metrics.py#L11) | Confusing a bull market for a trading edge |
| Stops evaluated on close, filled next open | [`src/backtest.py:54-61`](src/backtest.py#L54) | Assuming your stop filled at exactly the stop price |
| Chronological train/test split, never shuffled | [`run_ml.py:33`](run_ml.py#L33) | Training a model on its own future |
| Every run appended to a permanent leaderboard | [`server.py:110-114`](server.py#L110) | Quietly forgetting the ideas that failed |

Six of the eight headline experiments **lose** to buy & hold. The repository treats
that as the product, not as a failure — the README's own framing is that "the most
important output of this lab is the honest NO." This document takes that framing
seriously and, in [§21](#21-robustness-evidence-cost-sensitivity-and-parameter-surface),
pushes it one step further than the repository currently does: the one strategy the
lab rates as a *weak edge* is shown to be entirely inside the uncertainty of its own
cost assumption.

---

## 3. The central thesis and why it shapes the code

Almost every unusual choice in this codebase traces back to one belief, stated in the
first three lines of the README:

> *does a trading idea actually make money, after costs, against simply buying and holding?*

Read as an engineering requirement, that sentence contains four hard constraints,
and you can find each one physically embodied in the code:

**1. "actually" → the simulator must not be allowed to cheat.**
The engine is a bar-by-bar loop rather than a vectorised expression, specifically so
that the one-bar delay between decision and execution is *structural* rather than
something you remember to add. In a vectorised backtest, `returns = position *
close.pct_change()` is one keystroke away from look-ahead. In
[`src/backtest.py:25`](src/backtest.py#L25), `df["position"].iloc[i - 1]` makes the
delay impossible to omit.

**2. "make money" → the unit of truth is an equity curve in rupees, not a return series.**
[`src/backtest.py:52`](src/backtest.py#L52) appends `cash + units * close` every single
bar. Everything downstream — drawdown, final value, the chart — is derived from that
one array. There is no second definition of performance anywhere in the codebase.

**3. "after costs" → cost is applied at the point of execution, not subtracted at the end.**
[`src/backtest.py:32`](src/backtest.py#L32) and [`:45`](src/backtest.py#L45) scale the
cash at each fill. This matters because cost applied per-fill compounds against you,
while cost estimated at the end does not.

**4. "against simply buying and holding" → the benchmark is computed inside the same function as the strategy.**
[`src/metrics.py:11`](src/metrics.py#L11) builds the buy-and-hold curve from the *same*
DataFrame, over the *same* date range, in the *same* function that scores the strategy.
It is not possible to report a strategy return without also computing its benchmark.

**Why this matters architecturally:** these are not features bolted onto a backtester.
They are invariants enforced by the shape of the code. A contributor would have to
actively fight the structure to produce a dishonest result.

---

## 4. Repository map

### 4.1 Every tracked file

| Path | LOC | Layer | Role |
|---|---:|---|---|
| [`src/config.py`](src/config.py) | 9 | Core | Paths and the two global economic constants |
| [`src/data_loader.py`](src/data_loader.py) | 50 | Core | Three CSV dialects → one canonical table |
| [`src/indicators.py`](src/indicators.py) | 14 | Core | SMA / EMA column producers |
| [`src/signals.py`](src/signals.py) | 7 | Core | Indicator columns → binary `position` column |
| [`src/backtest.py`](src/backtest.py) | 71 | Core | Bar-by-bar execution simulator with risk exits |
| [`src/metrics.py`](src/metrics.py) | 44 | Core | Scoring, benchmarking, and the three-level verdict |
| [`run_experiments.py`](run_experiments.py) | 42 | Research | Batch of 6 experiments → rebuilds the leaderboard |
| [`run_ml.py`](run_ml.py) | 55 | Research | RandomForest direction model, judged by the same engine |
| [`run_momentum.py`](run_momentum.py) | 53 | Research | Cross-sectional momentum portfolio (own mini-engine) |
| [`fetch_data.py`](fetch_data.py) | 38 | Data | Yahoo Finance → `data/india/*d1.csv` |
| [`server.py`](server.py) | 134 | App | FastAPI backend: 5 endpoints + static mount |
| [`web/index.html`](web/index.html) | 670 | App | Entire front end: markup, CSS, JS, canvas chart |
| [`paper_bot.py`](paper_bot.py) | 104 | App | Forward paper trading with persistent state |
| [`test_loader.py`](test_loader.py) | 10 | Checks | Prints loader output for 4 files across 3 dialects |
| [`test_indicators.py`](test_indicators.py) | 17 | Checks | Prints last 3 rows of indicator columns + today's signal |
| [`test_backtest.py`](test_backtest.py) | 13 | Checks | End-to-end smoke run of the whole pipeline |
| [`test_risk.py`](test_risk.py) | 26 | Checks | Compares no-stop / fixed / trailing stop variants |
| [`results/leaderboard.csv`](results/leaderboard.csv) | 10 | Artifact | Persistent research diary — every experiment ever scored |
| [`results/paper_state.json`](results/paper_state.json) | 35 | Artifact | Paper bot's positions, pending orders, last candle seen |
| [`results/paper_diary.csv`](results/paper_diary.csv) | 2 | Artifact | Append-only log of paper fills and daily equity |
| [`README.md`](README.md) | 68 | Docs | Public-facing summary and findings table |
| [`requirements.txt`](requirements.txt) | 5 | Env | Unpinned dependency list |
| [`.gitignore`](.gitignore) | 25 | Env | macOS / Python / Jupyter / venv / IDE noise |
| `Untitled.ipynb` | 33 | Cruft | Empty Jupyter notebook, one empty cell |
| `test_...py files` | 0 | Cruft | 0-byte file, almost certainly a mistyped `touch` |
| `data/**` (36 CSVs) | — | Data | See [§12](#12-the-data-layer) |

### 4.2 Untracked directories present on disk

`__pycache__/`, `src/__pycache__/`, `.ipynb_checkpoints/`, `.virtual_documents/`,
`.DS_Store` — all correctly excluded by [`.gitignore`](.gitignore). `strategies/`
exists on disk but is **empty and untracked** (git does not track empty directories);
it is a placeholder from an earlier design in which strategies were going to be
plugin modules. The current design instead expresses a strategy as a *tuple of
parameters* passed through the pipeline, which is why the directory was never filled.

### 4.3 Notable absences

| Absent | Consequence |
|---|---|
| `src/__init__.py` | `src` works as a PEP 420 implicit namespace package. Imports resolve only when the process CWD is the repo root. There is no installable package and no `pyproject.toml`. |
| `pytest` / any assertion | The four `test_*.py` files print; they never assert. See [§18](#18-testing-strategy). |
| CI configuration | Nothing runs automatically on commit. |
| `requests` in `requirements.txt` | Imported at [`server.py:59`](server.py#L59); currently satisfied only as a transitive dependency of `yfinance`. |
| Version pins | Every dependency is unpinned; `pandas>=2.0` is a hard requirement (see [§19](#19-reproducibility-and-environment)). |

---

## 5. Architecture

### 5.1 The pipeline

```
                          ┌──────────────────────────────────────────┐
   data/*.csv  ─────────► │ data_loader.load_csv(filename)           │
   (3 dialects)           │   → DataFrame[date,open,high,low,        │
                          │      close,volume]  oldest-first         │
                          └───────────────────┬──────────────────────┘
                                              │  the canonical table
                          ┌───────────────────▼──────────────────────┐
                          │ indicators.add_ema / add_sma(df, period) │
                          │   → adds column  ema_20 / sma_200 ...    │
                          └───────────────────┬──────────────────────┘
                                              │
                          ┌───────────────────▼──────────────────────┐
                          │ signals.crossover_signal(df, fast, slow) │
                          │   → adds column  position ∈ {0,1}        │
                          └───────────────────┬──────────────────────┘
                                              │
                          ┌───────────────────▼──────────────────────┐
                          │ backtest.run_backtest(df, stop_loss=,    │
                          │                          trailing_stop=) │
                          │   → adds column  equity                  │
                          │   → returns     trades: list[dict]       │
                          └───────────────────┬──────────────────────┘
                                              │
                          ┌───────────────────▼──────────────────────┐
                          │ metrics.report(df, trades, name)         │
                          │   → prints the verdict                   │
                          │   → returns  dict of 10 scored fields    │
                          └───────────────────┬──────────────────────┘
                                              │
        ┌─────────────────┬───────────────────┼───────────────────┬────────────────┐
        ▼                 ▼                   ▼                   ▼                ▼
  run_experiments   test_backtest        run_ml.py           server.py         test_risk
  (leaderboard)     (smoke)          (ML positions)     (/api/backtest)      (stop study)
```

`run_momentum.py` is deliberately **outside** this pipeline — it needs a
cross-sectional, multi-asset engine that the single-asset `run_backtest` cannot
express. See [§14.3](#143-run_momentumpy--cross-sectional-momentum).

### 5.2 The dataflow contract

The entire system coordinates on one implicit interface: **a pandas DataFrame with
lowercase columns, one row per bar, sorted oldest-first, with a `date` column of
dtype `datetime64[ns]`.** Every stage takes that table, adds exactly one column, and
returns it.

**Why a shared mutable DataFrame instead of typed objects?**

- *Chosen:* zero ceremony. A new indicator is 3 lines. A new signal rule is 2. The
  research loop — "have an idea before lunch, have a verdict after lunch" — is the
  actual product, and object modelling would tax every iteration.
- *Rejected:* a `Strategy` base class with `generate_signals()`. That was clearly the
  original plan (the empty `strategies/` directory), and it was abandoned. The reason
  it *should* have been abandoned: with only two indicator types and one signal rule,
  a class hierarchy would be pure overhead with no polymorphism to justify it.
- *Cost of the choice:* the contract is enforced by convention only. Nothing stops a
  caller from passing a DataFrame sorted newest-first, or one whose `position` column
  contains `-1`. The engine would silently produce nonsense. See finding
  [F-7](#f-7--no-input-validation-on-the-dataframe-contract).

**Why mutate in place and also return `df`?**

Every function does `df["x"] = ...; return df`. The return value is the *same object*,
not a copy. This makes chaining read nicely (`df = add_ema(add_ema(df, 20), 50)`) but
it means the caller's original DataFrame is modified too. `test_risk.py` is the one
place that clearly understands this: [`test_risk.py:10-15`](test_risk.py#L10) defines
`prepare()` and calls it *fresh inside every loop iteration*, precisely so that the
`equity` column from the previous stop configuration cannot leak into the next.

### 5.3 Dependency direction

```
config  ◄──── data_loader
   ▲    ◄──── backtest
   │    ◄──── metrics
   │    ◄──── fetch_data, paper_bot, server, run_momentum

indicators  (depends on nothing but pandas)
signals     (depends on nothing at all)
```

`config` is a leaf that everything imports; `indicators` and `signals` import nothing
from the project. There are **no circular imports and no cross-layer back-references**
— `backtest` does not know what an EMA is, and `indicators` does not know what a trade
is. That separation is what allows [`run_ml.py:49`](run_ml.py#L49) to bypass
`indicators` and `signals` entirely and inject a machine-learning model's predictions
directly into the `position` column. **This is the single most valuable architectural
property in the repository**: the judge is decoupled from the strategy, so a
scikit-learn model and a moving-average crossover are scored by identical, unmodified
code.

---

## 6. Layer 1 — Configuration (`src/config.py`)

### What it does
Defines three paths and two economic constants — the entire global state of the system.

```python
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = BASE_DIR / "results"

CAPITAL = 100_000        # starting fake money (Rs 1 lakh)
COST_PER_SIDE = 0.001    # 0.1% broker cost on every buy and every sell
```

### How it works
`BASE_DIR` is derived from `__file__`, so paths are correct regardless of where the
*module* lives — but note this only fixes *data* paths, not the import path
(see [§19](#19-reproducibility-and-environment)).

### Why it is built this way

**Why `CAPITAL = 100_000`?** ₹1 lakh is the canonical "retail account" unit in India.
It makes every printed rupee figure immediately interpretable to the intended reader
without mental arithmetic. Because the engine buys *fractional units*, the absolute
value is mathematically arbitrary — all results scale linearly — so the number was
chosen purely for readability.

**Why `COST_PER_SIDE = 0.001` (10 basis points)?** This is a single blended figure
standing in for brokerage, exchange transaction charges, GST, STT, stamp duty, and
slippage combined. The decision to use *one* number rather than an itemised
Indian-market cost model is a deliberate trade: itemising would be more accurate for
one instrument class and misleading for the others (an index has no STT because you
cannot buy it; an ETF's costs differ from delivery equity's). One conservative blended
number keeps the model honest across every instrument in `data/` without pretending to
a precision it does not have.

**Why a module of constants rather than a config file or CLI flags?** Because there
are two of them. A YAML loader for two integers is negative value. The tradeoff is
that changing the cost assumption requires editing source — which is exactly what
[§21](#21-robustness-evidence-cost-sensitivity-and-parameter-surface) had to do to
run the sensitivity study.

### Consequences and failure modes

- `COST_PER_SIDE` is imported **by value** at [`src/backtest.py:10`](src/backtest.py#L10)
  (`from src.config import CAPITAL, COST_PER_SIDE`). Rebinding `src.config.COST_PER_SIDE`
  at runtime therefore has **no effect** on the engine — you must rebind
  `src.backtest.COST_PER_SIDE`. This is a real footgun for anyone trying to sweep the
  cost assumption, and it is why the study in §21 patches the `backtest` module.
- The paper bot maintains a *second*, independent notion of capital
  (`START_CASH_EACH = 20_000` at [`paper_bot.py:22`](paper_bot.py#L22), × 5 symbols).
  The invariant "5 × 20,000 == CAPITAL" is maintained by hand and enforced nowhere.

---

## 7. Layer 2 — Data loading (`src/data_loader.py`)

### What it does
Accepts a bare filename, finds it anywhere under `data/`, detects which of three CSV
dialects it is, and returns one canonical table.

### How it works

**Step 1 — resolution by search, not by path** ([`:8-13`](src/data_loader.py#L8)):

```python
matches = list(DATA_DIR.rglob(filename))
return matches[0]
```

Callers say `load_csv("XAUUSDd1.csv")`, never `load_csv("data/gold/XAUUSDd1.csv")`.

*Why:* the whole codebase — experiment lists, the web UI's watchlist, the query
string of `/api/backtest` — can then treat a filename as an opaque asset identifier.
Reorganising `data/` into new subfolders breaks nothing.

*Cost:* `matches[0]` on a multi-match is arbitrary (`rglob` order is filesystem-
dependent). Two files with the same basename in different folders is silent
ambiguity — see finding [F-6](#f-6--load_csv-silently-picks-the-first-of-several-matches).

**Step 2 — dialect detection by sniffing the first line** ([`:20-40`](src/data_loader.py#L20)):

| Sniff test | Dialect | Real example | Handling |
|---|---|---|---|
| starts with `Price,` | **A — Yahoo multi-header** | `data/NIFTY_10Y.csv` | `skiprows=[1, 2]` to discard the `Ticker` and blank `Date` rows; rename `Price` → `date`; lowercase all columns |
| contains `tick_volume` | **B — MetaTrader export** | all 35 files in `gold/` and `india/` | rename `Date`→`date`, `tick_volume`→`volume`; divide OHLC by 100 **if** `XAUUSD` in the filename |
| otherwise | **C — plain CSV** | (none currently present) | lowercase all columns |

*Why sniff rather than accept a `format=` argument?* Because the caller — a web query
string, a list of experiment tuples — does not know and should not need to know which
tool produced the file. Pushing dialect knowledge into a single 20-line block keeps
that concern out of all five consumers. This is the classic "anti-corruption layer"
pattern applied at the smallest possible scale.

*Why is the gold `/100` rescale keyed on the **filename**?* The MetaTrader export
stores gold in integer cents: the first row of `data/gold/XAUUSDd1.csv` reads
`172497.0`, meaning $1,724.97. The scale factor is metadata that simply is not present
inside the file, so it has to come from outside. The filename is the only carrier
available. It works, and it is honest about being a hack — but it is
**semantics encoded in a string**, which is fragile. See finding
[F-5](#f-5--gold-price-rescaling-is-keyed-on-the-filename).

**Step 3 — date parsing** ([`:43`](src/data_loader.py#L43)):

```python
df["date"] = pd.to_datetime(df["date"], format="mixed", dayfirst=True)
```

Both flags are load-bearing, and the data proves it:

| File | First timestamp | Requires |
|---|---|---|
| `data/gold/XAUUSDh1.csv` | `2012-05-17 08:00:00` | ISO parsing |
| `data/gold/XAUUSDm15.csv` | `15-05-2012 08:00` | `dayfirst=True` |
| `data/india/NIFTY50d1.csv` | `2007-09-17` | date-only parsing |
| `data/india/RELIANCEm15.csv` | `2026-04-23 09:15` | ISO + time |

Four different timestamp layouts across the same `data/` tree — `format="mixed"`
infers per element, and `dayfirst=True` resolves the `15-05-2012` ambiguity in favour
of the day. `format="mixed"` requires **pandas ≥ 2.0**; this is the project's real
minimum version, and it is not recorded in `requirements.txt`.

**Step 4 — normalise and clean** ([`:46-50`](src/data_loader.py#L46)):

```python
df = df[["date", "open", "high", "low", "close", "volume"]]
df = df.dropna(subset=["open", "high", "low", "close"])
df = df.sort_values("date").reset_index(drop=True)
```

*Why project the columns explicitly?* It doubles as a schema assertion — a file
missing `volume` raises `KeyError` here rather than producing subtly wrong results
three stages downstream.

*Why `dropna` only on OHLC, not on volume?* Because volume is never used by any
strategy in the repo — the index files carry `tick_volume = 0` throughout
(`data/india/NIFTY50d1.csv` row 1: `...,4494.65,0`). Dropping rows for missing volume
would throw away perfectly good price data.

*Why `sort_values` + `reset_index(drop=True)`?* The engine indexes positionally with
`.iloc[i]` and `.iloc[i-1]`. A non-contiguous index would still work with `.iloc`, but
`reset_index` guarantees that positional and label indexing agree, which matters when
callers slice the frame — `run_ml.py` slices out a test set and calls
`reset_index(drop=True)` again at [`run_ml.py:50`](run_ml.py#L50) for exactly this
reason.

### Consequences and failure modes

- **No duplicate-timestamp detection.** Two bars with the same `date` survive and are
  treated as two independent bars.
- **No OHLC sanity check.** Nothing verifies `low ≤ open,close ≤ high`, or that prices
  are positive.
- **No gap or calendar validation.** A missing week is indistinguishable from a
  weekend to the engine, because the engine counts *bars*, not *days*.
- **File handle leak** at [`:20`](src/data_loader.py#L20): `open(path).readline()` is
  never closed. CPython's refcounting closes it immediately in practice; on PyPy it
  would leak. Cosmetic, but it is the kind of thing a linter would catch and there is
  no linter.
- **Verified:** `NIFTY_10Y.csv` has 2,463 data rows and loses **zero** rows to
  `dropna` — the cleaning step is currently a no-op on the shipped data, which is
  worth knowing before you trust it to catch anything.

---

## 8. Layer 3 — Indicators (`src/indicators.py`)

### What it does
Two functions, each adding exactly one derived column.

```python
def add_sma(df, period):
    df[f"sma_{period}"] = df["close"].rolling(period).mean()
    return df

def add_ema(df, period):
    df[f"ema_{period}"] = df["close"].ewm(span=period, adjust=False).mean()
    return df
```

### Why it is built this way

**Why is the column name derived from the period (`f"sma_{period}"`)?** Because it
turns the indicator into a *namespace*. `add_ema(df, 20)` and `add_ema(df, 50)` can be
called on the same frame without collision, and the downstream signal function
addresses them by name. This is what makes the whole pipeline parameterisable from a
query string: [`server.py:105`](server.py#L105) constructs `f"{kind}_{fast}"` and
`f"{kind}_{slow}"` from user input, and it just works — no registry, no dispatch table.

**Why `adjust=False` on the EMA?** This is the most consequential one-word decision in
the file. Pandas defaults to `adjust=True`, which computes a *finite-window corrected*
EMA where early values are re-weighted to remove initialisation bias. Every trading
platform on earth — TradingView, MetaTrader, Zerodha Kite — uses the recursive form:

```
EMA_t = α·close_t + (1−α)·EMA_{t−1},   α = 2/(period+1)
```

which is `adjust=False`. Using the pandas default would produce indicator values that
**disagree with the chart the user is looking at**, making every result unverifiable
by hand. The comment in the source — *"the standard formula every trading book uses"* —
is exactly right.

**Why only close-based indicators, when the loader carefully preserves `high` and `low`?**
`high` and `low` are loaded, validated, and then never read by anything in the
repository. This is unused capability, retained because it is nearly free and because
the obvious next indicators (ATR, Donchian channels, intrabar stop fills) all need
them. It is latent design headroom, not an oversight — but a reader should know that
today the entire system is a function of `open` and `close` only.

### Consequences and failure modes

- **SMA emits `NaN` for the first `period−1` bars; EMA never does.** `ewm` seeds from
  the first observation, so `ema_50` has a value at row 0 — a value computed from a
  single close, which is meaningless as a 50-period average. The system's handling of
  this is entirely implicit; see [§9](#9-layer-4--signals-srcsignalspy) and finding
  [F-2](#f-2--warm-up-asymmetry-the-benchmark-gets-a-free-head-start).
- **No period validation.** `add_sma(df, 0)` raises inside pandas;
  `add_sma(df, 99999)` on a 2,463-row frame silently produces an all-`NaN` column,
  which becomes an all-zero `position`, which becomes a flat equity curve reported as
  a real result.

---

## 9. Layer 4 — Signals (`src/signals.py`)

### What it does
Seven lines. Converts two indicator columns into a binary market-exposure column.

```python
def crossover_signal(df, fast_col, slow_col):
    df["position"] = (df[fast_col] > df[slow_col]).astype(int)
    return df
```

### Why it is built this way

**Why "state" rather than "events"?** The name says *crossover*, but the implementation
computes a *state*: "is fast currently above slow", not "did fast cross above slow on
this bar". These differ on exactly one bar per crossing, and the state formulation is
the correct one for a backtester that asks "should I be invested today?" every day.
The event formulation would require separate entry and exit bookkeeping and would
behave badly if the engine ever missed a bar. **The state formulation is idempotent
and stateless — you can start the simulation on any bar and get the same answer.**

**Why binary 0/1 instead of −1/0/+1 (long/flat/short)?** Three reasons, in order of
weight:
1. Indian retail cannot easily short cash equity or an index without derivatives, so a
   short signal would be untradeable for the target user and would inflate results
   with returns nobody could capture.
2. The engine's position sizing (`units = cash/price`) has no representation for a
   negative position; supporting shorts would require modelling margin.
3. It keeps the honest comparison clean: 1 means "exposed, same as buy & hold", 0 means
   "in cash". The strategy's only lever is *timing*, which is precisely the hypothesis
   under test.

**Why does the `NaN` handling work by accident, and is that acceptable?**
During SMA warm-up, `sma_200` is `NaN`. In IEEE-754, any comparison with `NaN` is
`False`, so `.astype(int)` yields `0` → "stay out". That is exactly the desired,
conservative behaviour, and it is achieved with no code. The concern is that it is
*undocumented and unasserted*: a future contributor writing an inverted rule
(`fast < slow`) would get the same silent `False` → also "stay out" — which for an
inverted rule is arguably wrong, and nothing would flag it.

### Consequences and failure modes

- `fast_col == slow_col` (i.e. a user submitting `fast=50&slow=50` to the API) yields
  `position` all-zero, a perfectly flat equity curve, a 0% return, and a confident
  `LOSES to buy & hold` verdict. There is no error. The web UI's error text —
  *"is fast smaller than slow?"* at [`web/index.html:559`](web/index.html#L559) — is a
  guess at a failure that does not actually raise.

---

## 10. Layer 5 — The backtest engine (`src/backtest.py`)

This is the heart of the system and the file that most deserves close reading.

### 10.1 The execution model — the golden rule

```python
for i in range(len(df)):
    want_in = df["position"].iloc[i - 1] if i > 0 else 0
    open_price = df["open"].iloc[i]
```

**Everything hinges on line 25.** The position consulted on bar `i` is the one computed
from bar `i−1`'s close, and it is filled at bar `i`'s **open**.

The timeline, made explicit:

| Time | Event | Data available |
|---|---|---|
| Day N, 15:30 (close) | Indicators update; `position[N]` is computed | closes up to and including day N |
| Day N, evening | Risk checks run; a stop may be armed | close of day N |
| Day N+1, 09:15 (open) | The order fills at `open[N+1]` | — |
| Day N+1, 15:30 | Equity marked to `close[N+1]` | — |

**Why the *next open* and not the *same close*?** Filling at the same bar's close is
the most common form of backtest self-deception: you would be using day N's close to
*decide* and day N's close to *execute*, which is only possible if you can trade in the
past. Filling at the next open is what a human actually does — you review charts after
the market shuts and place an order for the following morning. It is also strictly
*pessimistic* relative to a same-close fill in a trending market, which suits the
project's bias toward conservative measurement.

**Why is `i=0` forced to `want_in = 0`?** There is no bar `−1`, and `iloc[-1]` in
pandas silently returns the **last** row of the frame. Without the `if i > 0` guard,
bar 0 would consult the *final* bar of history — a spectacular look-ahead bug. The
guard at [`:25`](src/backtest.py#L25) is not defensive style; it is a correctness
requirement created by pandas' negative-index semantics.

### 10.2 Position sizing and cost application

```python
# exit
cash = units * open_price * (1 - COST_PER_SIDE)
# entry
units = cash * (1 - COST_PER_SIDE) / open_price
```

**Why all-in / all-out?** The hypothesis under test is *timing*, and the benchmark is
100%-invested buy & hold. If the strategy were allowed to size positions, a favourable
result could come from sizing rather than timing, and the comparison would no longer
answer the stated question. Binary exposure makes the comparison an apples-to-apples
test of one variable.

**Why fractional units?** `units` is a float — 3.7461 shares. Real equity trading is in
whole shares, so this is an idealisation. It is the *right* idealisation for indices
(you cannot buy `^NSEI` at all, whole or fractional) and a minor one for a ₹1 lakh
account in liquid large caps, where the rounding error is a fraction of a percent and
is dwarfed by the cost model. Enforcing integer lots would add realism to the stock
tests and make the index tests impossible.

**Why is cost charged on the *cash* at entry rather than added to the price?**
`cash * (1 - 0.001) / price` and `cash / (price * 1.001)` differ in the sixth decimal.
The chosen form is the simpler statement of "0.1% of the money you deploy disappears",
and it applies symmetrically at exit. What matters — and what the code gets right — is
that **cost is charged at every fill, so it compounds**. Verified: the 17 trades of the
headline NIFTY experiment generate 34 fills, a compounded drag of **3.34% of capital**.
Hold that number; §21 shows the strategy's entire measured edge is +3.1 points.

### 10.3 Risk overlays and the `blocked` invariant

Two optional exits, both evaluated in the "evening" block at [`:54-61`](src/backtest.py#L54):

```python
if units > 0:
    if close > highest_close:
        highest_close = close
    if stop_loss is not None and close < entry_price * (1 - stop_loss):
        stop_hit = True
    if trailing_stop is not None and close < highest_close * (1 - trailing_stop):
        stop_hit = True
```

- `stop_loss` — a **fixed** floor measured from the entry price. Static.
- `trailing_stop` — a floor measured from the highest close since entry. It ratchets up
  and never comes down.

**Why are stops evaluated on the *close* and executed at the next *open*?**
This is the most sophisticated honesty decision in the codebase, and it is easy to miss.
The naive implementation checks whether the bar's **low** pierced the stop level and
fills *at the stop level*. That assumes (a) you were watching intrabar, and (b) you got
filled at your exact price. Both assumptions systematically flatter results, because
they hand the backtest a free exit at the best moment of a bad day. By checking the
close and filling at the next open, this engine **eats the overnight gap** — exactly
what a real end-of-day trader eats. The `high`/`low` columns are available and are
deliberately not used here.

**The `blocked` flag** ([`:21,28-30,41`](src/backtest.py#L28)) is the subtle part:

```python
if blocked and want_in == 0:
    blocked = False
...
if stop_hit:
    blocked = True
```

After a stop-out, re-entry is forbidden **until the signal itself resets to 0**.

*Why?* Without it, a stop that fires while the crossover signal is still bullish would
sell at tomorrow's open and immediately buy back at the same open — an infinite churn
machine that pays 0.2% per round trip for nothing. `blocked` makes the stop a *pure
exit-timing modifier*: it can only ever make an exit **earlier** than the signal would
have, never create a new round trip.

**This invariant is empirically verified.** Running `test_risk.py` on identical data:

| Configuration | Return | Worst fall | Closed trades | Stops fired |
|---|---:|---:|---:|---:|
| no stop | +184.8% | −15.1% | 16 | 0 |
| 5% fixed stop | +184.8% | −15.1% | 16 | 0 |
| 5% trailing stop | **+93.6%** | **−16.3%** | 16 | 12 |
| 10% trailing stop | +184.8% | −15.1% | 16 | 0 |

The trade count is **identical at 16 in every configuration**, even when 12 of those
16 exits were stop-outs rather than signal exits. That is `blocked` working exactly as
designed. It also isolates the finding cleanly: the 5% trailing stop did not add
churn — it simply cut 12 winning trades short, which is why the return halved while
the drawdown got *worse*. A stop that exits during normal retracements in an
already-conservative trend strategy removes upside without removing risk.

### 10.4 Equity accounting

```python
close = df["close"].iloc[i]
equity.append(cash + units * close)
```

One value per bar, appended **after** any fill on that bar, marked at that bar's close.

**Why mark to close rather than to the fill price?** Because the equity curve must be
comparable to buy & hold, which is a close-to-close series. Marking to the fill would
make the curve jump at trade boundaries for reasons unrelated to market movement.

**Why does cash earn 0% while out of the market?** Real idle cash earns something — a
liquid fund or T-bills would return 4–7% annualised in India over this period. Setting
it to zero is a **deliberate conservative bias against the timing strategy**: a
strategy that sits in cash 30% of the time is denied ~2% a year it would really have
earned. Given the project's stated bias toward the honest NO, erring in this direction
is defensible — but it should be a documented modelling choice, and it currently is
not documented anywhere. It is also the one bias that, if corrected, would *help* the
strategy being tested. Verified exposure figures, which tell you how much this matters
per experiment:

| Experiment | Time in market | Cash-drag exposure |
|---|---:|---|
| EMA 20/50 on NIFTY_10Y | 70.5% | 29.5% of 10 years earning 0% |
| EMA 9/21 on NIFTY_10Y | 65.3% | 34.7% |
| SMA 50/200 on NIFTY_10Y | 70.4% | 29.6% |
| SMA 50/200 on XAUUSD | 50.0% | 50.0% |
| EMA 20/50 on RELIANCE | 59.5% | 40.5% |

### 10.5 Trade records

Each closed trade is a dict with `entry_date`, `entry`, `exit_date`, `exit`,
`pnl_pct`, and `reason ∈ {"signal", "stop", "open"}`.

**Why record `reason`?** So a stop study can count `reason == "stop"`
([`test_risk.py:26`](test_risk.py#L26)) and the UI can display *why* each trade closed.
This is the diagnostic hook that turned "the trailing stop made things worse" from an
opinion into a measurement.

**Why is an unclosed final position recorded with `exit=None`?**
[`:63-69`](src/backtest.py#L63) appends a synthetic record with `pnl_pct` computed from
the last close, so the trade log shows the open position, while
[`src/metrics.py:20`](src/metrics.py#L20) filters `exit is not None` before computing
win rate. **The open trade is visible but does not pollute the statistics** — the right
call, since an open trade's outcome is not yet known and counting a currently-profitable
open position as a "win" is a well-known way to inflate win rates.

### 10.6 Complexity and scale

`O(n)` in bars, with `.iloc` scalar access per bar. That is Python-loop speed: roughly
2,500 bars runs instantly, and the 230,400-row `XAUUSDm15.csv` would take on the order
of ten seconds. Nothing in the repo currently backtests intraday data, so this has
never been a constraint. **Why not vectorise?** Because — as argued in
[§3](#3-the-central-thesis-and-why-it-shapes-the-code) — the loop is what makes the
one-bar delay structural. Trading ~10× speed for the elimination of an entire class of
correctness bug is the right trade at this scale, and it would remain right until
someone wants a 36-file × 36-parameter sweep on minute data.

---

## 11. Layer 6 — Metrics and the verdict system (`src/metrics.py`)

### What it does
Consumes a finished backtest and produces (a) a printed human report and (b) a
10-field dict for the leaderboard.

### How it works

```python
final     = df["equity"].iloc[-1]
strat_ret = (final / CAPITAL - 1) * 100
bh_curve  = df["close"] / df["open"].iloc[0] * CAPITAL
bh_ret    = (bh_curve.iloc[-1] / CAPITAL - 1) * 100
peak      = df["equity"].cummax()
max_dd    = ((df["equity"] - peak) / peak).min() * 100
margin    = strat_ret - bh_ret
```

**The benchmark construction** at [`:11`](src/metrics.py#L11) is the load-bearing line:
buy at the **first bar's open** — the same price the strategy's first possible fill
would use — and mark to close every bar thereafter. Same instrument, same window, same
starting capital.

**Why is `margin` the primary score, and why is the leaderboard sorted by it?**
Because raw return is a measure of the market, not of the idea. RELIANCE returned
+18,031% over 30 years; a strategy returning +667% on RELIANCE looks spectacular in
isolation and is in fact a catastrophe. Sorting by `margin` at
[`run_experiments.py:37`](run_experiments.py#L37) and [`server.py:52`](server.py#L52)
means the leaderboard is ordered by *skill*, not by *luck about which asset you picked*.

**The three-level verdict** ([`:25-30`](src/metrics.py#L25)):

| Condition | Verdict | Design intent |
|---|---|---|
| `margin > 10` | `BEATS buy & hold` | Clearly ahead, worth pursuing |
| `0 < margin ≤ 10` | `WEAK EDGE - real but thin, verify before trusting` | Ahead, but inside the noise |
| `margin ≤ 0` | `LOSES to buy & hold - bin it` | Discard |

**Why three levels and not two?** Because a binary pass/fail invites you to celebrate
a +0.3 point win as a discovery. The middle tier exists to name the most dangerous
outcome in quantitative research — the result that is *technically* positive and
*practically* meaningless. The tier's label literally instructs the reader to distrust
it. This is a genuinely thoughtful piece of design.

**Why does the report `print` as a side effect *and* return a dict?**
The printed block is the research-loop interface (you run a script, you read a verdict);
the dict is the machine interface (leaderboard row, JSON response). Both consumers are
first-class, and merging them into one function guarantees they can never disagree.
The cost is that `report()` is not a pure function and cannot be called silently —
[`server.py:107`](server.py#L107) prints to the server's stdout on every API request as
a side effect of serving JSON.

### Consequences and failure modes — read this section carefully

**1. The `margin > 10` threshold is not horizon-normalised.**
`margin` is a difference of *total* returns over the whole sample. Ten percentage
points over 10 years (NIFTY) and ten points over 30 years (RELIANCE) receive the same
verdict, though the first is ~4× more impressive annualised. Any comparison of rows
across different date ranges in the leaderboard is therefore **not valid**, and the
leaderboard's single sorted list invites exactly that comparison. The fix is to store
CAGR alongside total return and threshold on annualised excess.

**2. Buy & hold pays no transaction cost.** The strategy pays 0.1% on every fill; the
benchmark pays nothing, not even the single entry fill it would really need. This is
a ~0.1 point handicap on the strategy — negligible, correctly directioned
(conservative), and worth stating explicitly so nobody "discovers" it later and thinks
the engine is broken.

**3. Warm-up asymmetry — the largest measurement bias in the system.**
The DataFrame is never trimmed of its indicator warm-up period. For SMA 50/200 on
NIFTY_10Y there are **199 leading rows** where `sma_200` is `NaN`, so `position` is
forced to 0 and the strategy is *structurally forbidden from being invested* — while
the benchmark, which starts at row 0, is fully invested throughout. **Verified: buy &
hold banks +9.8% during a window in which the strategy cannot participate.** That
inflates the benchmark's total return and depresses the margin by roughly the same
amount, and it affects long-lookback strategies far more than short ones — meaning the
lab is systematically biased *against* slow indicators for a purely mechanical reason.
See finding [F-2](#f-2--warm-up-asymmetry-the-benchmark-gets-a-free-head-start).

**4. Missing metrics.** There is no CAGR, no volatility, no Sharpe or Sortino, no
exposure percentage, no per-trade cost tally, no average win/loss, no profit factor,
no drawdown *duration*. Notably, `max_dd` and `bh_dd` are both reported, which is the
single most valuable risk comparison — and it is what produced the project's best
finding (EMA 20/50 on NIFTY loses on return but halves the drawdown, so "the edge is
safety, not return"). The gap is that *risk-adjusted* return is never computed, so
that finding stays qualitative when it could be quantitative.

---

## 12. The data layer

### 12.1 Inventory — all 36 files

**Yahoo multi-header (dialect A) — 1 file**

| File | Rows | Range |
|---|---:|---|
| `data/NIFTY_10Y.csv` | 2,463 | 2016-07-18 → 2026-07-16 |

**Gold, MetaTrader export (dialect B), prices ×100 — 5 files**

| File | Rows | Range |
|---|---:|---|
| `data/gold/XAUUSDd1.csv` | 2,400 | 2012-11-14 → 2022-03-04 |
| `data/gold/XAUUSDh4.csv` | 14,400 | 2012-10-26 → 2022-03-04 |
| `data/gold/XAUUSDh1.csv` | 57,600 | 2012-05-17 → 2022-03-04 |
| `data/gold/XAUUSDm30.csv` | 115,200 | 2012-05-16 → 2022-03-04 |
| `data/gold/XAUUSDm15.csv` | 230,400 | 2012-05-15 → 2022-03-04 |

Note the exact round row counts (2,400 / 14,400 / 57,600 / 115,200 / 230,400) — these
are fixed-size MetaTrader exports ("last N bars"), not full histories. The end date is
identical across all five, so the *start* dates differ purely as a function of bar size.

**India, MetaTrader-style header (dialect B) — 30 files (6 symbols × 5 timeframes)**

| Symbol | `d1` rows | `d1` range | `h1`/`h4` from | `m15`/`m30` from |
|---|---:|---|---|---|
| NIFTY50 | 4,619 | 2007-09-17 → 2026-07-17 | 2023-08-02 | 2026-04-23 |
| SENSEX | 7,154 | 1997-07-01 → 2026-07-17 | 2023-08-02 | 2026-04-23 |
| RELIANCE | 7,666 | 1996-01-01 → 2026-07-17 | 2023-08-02 | 2026-04-23 |
| HDFCBANK | 7,669 | 1996-01-01 → 2026-07-17 | 2023-08-02 | 2026-04-23 |
| INFY | 7,669 | 1996-01-01 → 2026-07-17 | 2023-08-02 | 2026-04-23 |
| TCS | 5,942 | 2002-08-12 → 2026-07-17 | 2023-08-02 | 2026-04-23 |

TCS starts in 2002 because that is when it listed — a genuine data property, not a gap.

### 12.2 Why `NIFTY_10Y.csv` still exists alongside `NIFTY50d1.csv`

They are the same index from two sources with different histories and slightly
different values (last close 24,119.20 vs 24,334.30 — different index series and
different final dates). `NIFTY_10Y.csv` is the **original** file the lab was built on,
and it remains the default in [`web/index.html:517`](web/index.html#L517) and the
subject of the headline result. Keeping it means every published number in the README
stays reproducible byte-for-byte. Deleting it in favour of the longer `NIFTY50d1.csv`
would silently change the project's flagship finding. **Retaining a frozen reference
dataset is the correct call for a research repo** — it should just be labelled as such
in the file tree, which it currently is not.

### 12.3 Data is committed to git — deliberate, with a cost

28 MB of CSV in a 19 MB `.git`. **Why:** the README's claim is "all reproducible from
this repo's data", and that claim is only true if the data ships with the code. A
`.gitignore`d data directory plus a fetch script would make historical results
unverifiable the moment a vendor revised its history. **Cost:** clone size, and the
fact that re-running `fetch_data.py` rewrites tracked files, producing large diffs
that make the git history hard to read.

### 12.4 30 of 36 files are currently dead weight

Only `NIFTY_10Y.csv` and the `*d1.csv` files are used by any strategy. The intraday
files (h1/h4/m15/m30) are exercised only by `test_loader.py`, and only to prove the
loader handles their timestamp formats. They account for the large majority of the
28 MB. They are not *wrong* to keep — they are the raw material for the intraday
research the pipeline can already support — but a reader should not assume the lab has
tested anything intraday. It has not.

---

## 13. Data acquisition (`fetch_data.py`)

### What it does
Downloads full daily history for six Indian symbols from Yahoo Finance and writes them
into `data/india/` in dialect B.

### How it works

```python
df = yf.Ticker(ticker).history(period="max", interval="1d", auto_adjust=False)
if getattr(df.index, "tz", None) is not None:
    df.index = df.index.tz_localize(None)
out.columns = ["open", "high", "low", "close", "tick_volume"]
out.index = out.index.strftime("%Y-%m-%d")
```

### Why it is built this way

**Why write the MetaTrader dialect rather than a new, cleaner format?** Because
`data/india/` already contained 30 MetaTrader-format files. Emitting a fourth dialect
would mean touching the loader; emitting the existing one means the refreshed files
drop straight in. **The writer conforms to the reader's existing contract** — the right
direction of dependency.

**Why `period="max"`?** Full history is the point. It is what makes the RELIANCE
1996–2026 experiment possible, and that experiment produced the lab's most instructive
result (a 30-year compounder cannot be beaten by timing).

**Why `tz_localize(None)`?** Yahoo returns timezone-aware timestamps. Mixing tz-aware
and tz-naive datetimes raises in pandas comparisons, and the rest of the corpus is
naive. Stripping the tz at the boundary keeps one convention everywhere.

**Why `auto_adjust=False`?** This keeps the raw quoted Close rather than a
dividend-adjusted series, so the CSV matches what a chart shows. The consequence is
that **dividends are excluded from every return in this repository** — the web UI says
so explicitly in its honesty strip at [`web/index.html:487`](web/index.html#L487).
The direction of the resulting bias matters and is worth being precise about: excluding
dividends *understates* buy & hold's true total return, which makes the benchmark
easier to beat. **This is the one modelling bias in the entire system that favours the
strategy under test**, and it partly offsets the cash-drag and warm-up biases that run
the other way. None of these three offsetting biases is quantified anywhere.

**Why is `SYMBOLS` a hardcoded dict with a commented-out example?** Because the
intended workflow is "edit two lines, re-run". For a single-operator research lab, a
dict literal beats a CLI parser. The web UI's `/api/add` endpoint later generalised
this to arbitrary symbols at runtime.

### Consequences and failure modes

- **No incremental update** — every run re-downloads full history and overwrites. Slow,
  rate-limit-prone, and it rewrites 6 tracked files each time.
- **No retry, no backoff.** An empty response prints "nothing returned, skipped" and
  moves on. A *partial* response, however, silently truncates the file — that is the
  dangerous case, and it is not detected.
- **No validation against the previous file.** A vendor glitch that halves a price
  series would be committed without complaint.

---

## 14. Experiment runners

### 14.1 `run_experiments.py` — the batch harness

Six hardcoded experiments as tuples of `(file, kind, fast, slow)`, each run through
the full pipeline, collected into a DataFrame, sorted by `margin`, written to
`results/leaderboard.csv`.

**Why tuples in a module-level list?** The list *is* the experiment registry. Adding an
idea is one line. It is version-controlled, diffable, and reviewable — you can see in
`git log` exactly which ideas were tried and when. A database or a YAML file would
lose that property.

**Why sort by margin and print a summary table?** The final `to_string(index=False)`
block is the actual deliverable of a research session: a ranked list of what beat the
market and what did not.

**The critical flaw:** [`run_experiments.py:39`](run_experiments.py#L39) does
`board.to_csv(out_file, index=False)` — an unconditional **overwrite**. Meanwhile
[`server.py:110-114`](server.py#L110) *merges* new rows into the same file. So running
`run_experiments.py` silently destroys every result the web UI has accumulated. Two
writers, two incompatible policies, one file, no locking. See finding
[F-1](#f-1--two-writers-with-incompatible-policies-on-resultsleaderboardcsv).

### 14.2 `run_ml.py` — machine learning, judged by the same engine

**Features** ([`:18-25`](run_ml.py#L18)) — six, all strictly backward-looking:

| Feature | Definition | Captures |
|---|---|---|
| `ret_1` | 1-bar % change | Short-term reversal/momentum |
| `ret_5` | 5-bar % change | Weekly momentum |
| `ret_20` | 20-bar % change | Monthly momentum |
| `dist_ema20` | `close/ema_20 − 1` | Stretch from short trend |
| `dist_ema50` | `close/ema_50 − 1` | Stretch from medium trend |
| `vol_20` | 20-bar std of `ret_1` | Volatility regime |

**Why these six?** They are scale-free (ratios and percentages, not price levels), so
the model cannot learn "NIFTY was cheap in 2016" — a level feature would let a tree
memorise the date. Every one of them is a transformation of data available at the
close of the bar it sits on.

**Target** ([`:28`](run_ml.py#L28)): `(close.shift(-1) > close)` — will tomorrow close
higher than today?

**Why is the alignment correct?** Row `i` holds features from bar `i` and a target
describing bar `i+1`. Prediction `pred[i]` is written to `position[i]`
([`:49`](run_ml.py#L49)), and the engine reads `position[i]` to fill at `open[i+1]`.
So: decide at close of day `i`, fill at open of day `i+1`, capture day `i+1`'s move.
**No look-ahead** — and it is worth noting that this correctness comes for free from
reusing the engine, rather than from care taken in the ML script.

**Split** ([`:33-34`](run_ml.py#L33)): `split = int(len(df) * 0.7)`, `iloc[:split]` /
`iloc[split:]`. Chronological, never shuffled. **Why:** shuffling time series is the
canonical ML-on-markets failure — random k-fold lets the model train on Thursday to
predict Wednesday, producing accuracies that evaporate live.

**Model** ([`:38`](run_ml.py#L38)): `RandomForestClassifier(n_estimators=200,
min_samples_leaf=20, random_state=42)`. `min_samples_leaf=20` is the anti-overfitting
lever — it forbids leaves that memorise a handful of days. `random_state=42` makes runs
reproducible.

**The two-stage judgement** — the best idea in this file:

1. **Accuracy vs a dumb baseline** ([`:43-46`](run_ml.py#L43)): compare against
   "always predict up", whose accuracy is simply the base rate of up-days (53.2%).
   Reporting 53.6% accuracy without that baseline would look like a working model.
2. **Then the backtest** ([`:51-52`](run_ml.py#L51)): the predictions become positions
   and the *same* `run_backtest` + `report` decide the verdict. Result: −3.0% vs
   +22.3% for buy & hold over the test window.

The conclusion — a model can be genuinely, measurably better than the baseline and
still lose money, because a 0.4-point accuracy edge cannot survive 0.2% per round trip
— is exactly the lesson the architecture was built to surface.

**Documentation correction:** both the README and the module docstring describe this
as **"walk-forward"** validation. It is not. Walk-forward means repeatedly retraining
on an expanding or rolling window and testing on the segment immediately after, then
sliding forward. What this code does is a **single chronological holdout split** —
train once on the first 70%, test once on the last 30%. The holdout is honest and is
the right *first* step; it is simply a weaker protocol than the name claims, and it
leaves the model with no exposure to regime change after 2023. See finding
[F-3](#f-3--run_mlpy-is-a-single-holdout-split-not-walk-forward-validation).

**Other limitations:** the decision threshold is fixed at 0.5 (`predict`, not
`predict_proba`), so there is no way to trade only high-confidence days — the obvious
next experiment, given that a 53.6% model that trades every day may well be a 60%
model that trades twenty days a year. No class weighting, no feature selection, no
hyperparameter search. The absence of a hyperparameter search is arguably a *virtue*
here: it means the reported result carries no selection bias.

### 14.3 `run_momentum.py` — cross-sectional momentum

**Why does this file bypass the core engine?** `run_backtest` models one instrument and
one binary position. Cross-sectional momentum requires ranking N assets against each
other and holding a rotating subset. That is a genuinely different computation, not a
parameterisation of the existing one. Writing a 30-line purpose-built loop is more
honest than contorting the engine — but it does mean this experiment's results are
produced by code that has none of the engine's guarantees.

**Mechanics:**

```python
prices = pd.DataFrame({name: load_csv(f).set_index("date")["close"]
                       for name, f in FILES.items()}).dropna()
for i in range(LOOKBACK, len(prices) - 1, HOLD):
    momentum = prices.iloc[i] / prices.iloc[i - LOOKBACK] - 1
    picks = set(momentum.nlargest(TOP_N).index)
    if picks != current:
        value *= (1 - 2 * COST_PER_SIDE)
    segment = prices[list(picks)].iloc[i:i + HOLD + 1]
    value *= (segment.iloc[-1] / segment.iloc[0]).mean()
```

- `LOOKBACK = 126` ≈ 6 months, `HOLD = 21` ≈ 1 month, `TOP_N = 2` of 4.
  These are the textbook Jegadeesh–Titman parameters, chosen so the test measures the
  *published* effect rather than a tuned variant.
- `.dropna()` on the joined frame keeps only dates all four symbols share — necessary
  because TCS listed in 2002. Cross-sectional ranking on partially-missing rows would
  compare different universes on different days.
- The `i:i+HOLD+1` slice with a step of `HOLD` produces **contiguous, non-overlapping**
  holding periods. Correct.
- `(segment.iloc[-1] / segment.iloc[0]).mean()` is equal-weighting the picks and
  implicitly rebalancing to equal weight at each rotation.

**Four methodological issues, in descending severity:**

1. **Selection bias in the universe.** RELIANCE, TCS, HDFCBANK and INFY are four of
   India's largest companies *as of today*. Choosing them with hindsight means the
   buy-and-hold benchmark is composed of known 25-year winners — an unusually strong
   opponent that no real 2002 investor could have assembled. This inflates the
   benchmark and makes momentum's loss look worse than a fair test would. The same
   critique applies to the RELIANCE single-stock experiment.
2. **Cost is charged on the whole portfolio for a partial turnover.**
   `value *= (1 - 2*COST_PER_SIDE)` deducts 0.2% of total value whenever the pick *set*
   changes at all. Swapping one of two holdings really costs ~0.1% of total value
   (0.1% on the half sold plus 0.1% on the half bought). The model therefore charges
   roughly **double** the true cost on a one-name rotation, biasing against momentum.
3. **The comparison is not like-for-like on rebalancing.** Momentum is rebalanced to
   equal weight monthly; the benchmark is bought once and never rebalanced. Monthly
   rebalancing is itself a strategy with its own return contribution, so part of the
   measured difference is a rebalancing effect rather than a momentum effect.
4. **Endpoint mismatch.** The momentum loop runs `range(LOOKBACK, len-1, HOLD)`, so it
   may stop up to 20 bars short of the final date, while the benchmark is measured to
   the exact last bar. Minor, but it makes the two returns cover slightly different
   windows.

**Why the finding is still sound despite these:** the reported gap is ~1,450 points,
far larger than the sum of these biases (two of which run *against* momentum and would
have to be corrected in momentum's favour). The stated conclusion — momentum needs a
wide universe, and top-2-of-4 is a concentration bet, not a factor — survives. The
`pick_counter` output at [`:52-54`](run_momentum.py#L52) is a nice diagnostic touch: it
shows whether the strategy actually rotated or just held the same two names.

---

## 15. The web application

### 15.1 `server.py` — FastAPI backend

| Endpoint | Method | Purpose | Side effects |
|---|---|---|---|
| `/api/watchlist` | GET | Last close + daily change for every `*d1.csv` and `*10Y*` file | Reads and fully parses every daily CSV on each call |
| `/api/leaderboard` | GET | The leaderboard CSV as JSON, sorted by margin | None |
| `/api/search?q=` | GET | Proxy to Yahoo's symbol search, filtered to `.NS`/`.BO` | Outbound HTTP |
| `/api/add?symbol=` | GET | Download full history of any Yahoo symbol into `data/india/` | **Writes a new CSV** |
| `/api/backtest?file=&kind=&fast=&slow=&trailing=` | GET | Run the pipeline, return metrics + decimated curves + last 12 trades | **Appends to the leaderboard** |
| `/` | GET | `StaticFiles(directory="web", html=True)` | None |

**Why is the entire API `GET`, including the two endpoints that write?**
`/api/add` and `/api/backtest` both mutate the filesystem, which by HTTP semantics
should be `POST`. The choice buys one real thing: every backtest is a **shareable,
bookmarkable URL** — you can paste `/api/backtest?file=NIFTY50d1.csv&kind=ema&fast=20&slow=50`
to a colleague and they get the identical result. For a single-user localhost research
tool, that ergonomic win outranks REST purity, and there is no CSRF surface to worry
about. It is a defensible violation, but it *is* a violation, and it should not survive
the tool being exposed beyond localhost.

**Why is the leaderboard written on every backtest?** ([`:109-114`](server.py#L109))

```python
row = pd.DataFrame([r])
if board_file.exists():
    row = pd.concat([pd.read_csv(board_file), row])
row.drop_duplicates(subset="name", keep="last").to_csv(board_file, index=False)
```

*"every run auto-saves to the leaderboard — the research diary grows itself"*. This is
the project's most distinctive product decision: **you cannot run an experiment without
recording it.** Deduplication is on `name` with `keep="last"`, so re-running the same
parameters updates the row rather than duplicating it, while different parameters
create a new row. The mechanism makes it structurally impossible to quietly forget a
failed idea — which is the discipline the whole project is built around.

Its weakness is that identity is the *display string*. `run_experiments.py` produces
`"EMA 20/50 on NIFTY_10Y"` and `server.py` produces `"EMA 20/50 · NIFTY_10Y"` — the same
experiment under two names. Both are sitting in `results/leaderboard.csv` right now, as
rows 2 and 9, with identical numbers.

**Why is dependency importing deferred into the endpoint bodies?**
`import requests` at [`:59`](server.py#L59) and `import yfinance as yf` at
[`:80`](server.py#L80) sit inside their functions rather than at module top. This keeps
server startup fast (yfinance is heavy) and means the server still boots and serves
backtests if those packages are missing. Given `requests` is not even in
`requirements.txt`, that graceful degradation is doing real work.

**Why does `/api/watchlist` compute a `stale` flag?**

```python
stale = (pd.Timestamp.now() - df.date.iloc[-1]).days > 30
"exchange": "CSV" if stale else ("NSE INDEX" if ... else "NSE"),
"tag": f"HIST {df.date.iloc[-1].year}" if stale else "",
```

Gold data ends in March 2022. Displaying `$1,969.74` next to live NIFTY prices would
imply it is a current quote. The `HIST 2022` badge and the demotion of the exchange
label to `CSV` prevent a stale number from masquerading as a live one — the honesty
principle applied to the UI layer, not just the maths.

**Why decimate the chart series?** ([`:116`](server.py#L116))

```python
step = max(1, len(df) // 300)
```

Roughly 300 points per line keeps the JSON small and the canvas fast. **Metrics are
always computed on the full series** — only the drawn line is decimated. The tradeoff
is honest but should be stated in the UI: on a 7,600-row RELIANCE chart, `step = 25`,
so a sharp single-day drawdown can fall between sampled points and be invisible on the
plot while still being correctly reported in the `Worst fall` figure.

**Endpoint ordering matters.** `app.mount("/", StaticFiles(...))` is the **last** line
of the file ([`:135`](server.py#L135)). FastAPI matches routes in registration order, so
the five `/api/*` routes must be registered before the catch-all mount. Moving that line
up would break the entire API — worth knowing before anyone "tidies" the imports.

**`StaticFiles(directory="web")` is CWD-relative**, unlike everything else in the
project, which goes through `config.BASE_DIR`. The server therefore only works when
launched from the repository root. An inconsistency, not a bug — but the one path in
the codebase that does not follow the project's own convention.

### 15.2 `web/index.html` — the front end

670 lines: markup, CSS, and JavaScript in one file. No build step, no framework, no CDN.

**Why a single hand-written file with zero dependencies?**
- It loads instantly and works offline.
- There is no `npm install`, no bundler, no lockfile, no toolchain to rot. In five
  years this file will still open.
- The whole app is one screen with about eight dynamic regions. React's value
  proposition — managing state across a large component tree — does not apply.
- It matches the project's overall stance: build the thing from scratch, understand
  every line.

**Why is the design a deliberate imitation of Zerodha Kite?**
The header with live index tickers, the left watchlist with per-row price and percent
change, the "order form" containing strategy parameters instead of quantity and price.
Presenting a research tool in the visual language of the broker terminal the target
user already uses removes the entire learning curve — the user knows where to click
before reading anything. The "order form" framing is the sharpest touch: filling in
`fast`, `slow`, `trailing stop` and pressing **Run** is placed exactly where placing a
real order would be, which quietly reinforces that this is the step that comes *before*
real orders.

**The honesty strip** ([`:487`](web/index.html#L487)) sits permanently under the order
form:

> `0.1% cost per side · fills at next day's open · no look-ahead · dividends excluded`

The methodology is stated on the screen where results appear, not buried in a README.
Every result the user sees is annotated with the assumptions that produced it.

**Key JS behaviours:**

| Function | Line | Notes |
|---|---|---|
| `loadWatchlist()` | [`:523`](web/index.html#L523) | Fetches watchlist, renders rows, populates the two header index tickers |
| `renderWL()` | [`:532`](web/index.html#L532) | Local substring filter over the already-loaded list — instant, no network |
| `run()` | [`:547`](web/index.html#L547) | Builds the query string, fetches, renders, refreshes the leaderboard |
| `render(d)` | [`:563`](web/index.html#L563) | Applies `win`/`weak`/`lose` CSS class from `margin`, mirroring the Python thresholds |
| `draw(d)` | [`:591`](web/index.html#L591) | ~25 lines of raw Canvas 2D: 3 gridlines, dashed benchmark, solid strategy |
| `loadBoard()` | [`:614`](web/index.html#L614) | Renders the leaderboard with `Beats` / `Weak edge` / `Bin it` chips |
| `remoteSearch()` | [`:636`](web/index.html#L636) | 350 ms debounce, then Yahoo search; appends "+ add & test" rows for symbols not yet downloaded |
| `addSym(symbol)` | [`:653`](web/index.html#L653) | Downloads, reloads the watchlist, and immediately backtests the new symbol |

**Why a hand-rolled canvas chart instead of Chart.js?** Two lines are drawn. Chart.js
is ~200 KB to draw two polylines, and it would be the project's only external
dependency, breaking the offline guarantee. Twenty-five lines of Canvas 2D is the
proportionate answer. The cost is real and should be named: no tooltips, no zoom, no
crosshair, no responsive resize (the canvas is hard-coded to 940×260 at
[`:593`](web/index.html#L593)).

**Why is the verdict threshold logic duplicated in JavaScript?**
[`:567`](web/index.html#L567) and [`:619`](web/index.html#L619) both re-derive
`margin > 10 ? 'win' : margin > 0 ? 'weak' : 'lose'`, which restates
[`src/metrics.py:25-30`](src/metrics.py#L25). The server already sends the authoritative
`verdict` string; the client re-computes the *tier* only to pick a CSS class. It works,
but the threshold `10` now lives in three places. Changing it in Python alone would
leave the UI colouring rows by the old rule.

**The search-then-add flow is the best UX idea in the app.** Type three letters →
debounced Yahoo search → symbols you do not have appear at the bottom of the watchlist
marked "not downloaded yet" → one click downloads the full history and immediately
backtests it. The gap between "I wonder about TATAMOTORS" and "here is its verdict" is
two clicks and no terminal.

---

## 16. The paper-trading bot (`paper_bot.py`)

### What it does
Runs the lab's one validated strategy (EMA 20/50) forward in real time on five
instruments with ₹20,000 of fake money each, persisting state between daily runs.

### Why it exists — the pipeline stage that makes the project credible

A backtest is a claim about the past. Paper trading is the same claim tested against
data the strategy has never seen, at the speed reality actually arrives. It is the only
step that can catch the failure modes a backtest structurally cannot: data-vendor
revisions, missed runs, symbols that stop reporting, and the operator's own discipline.
The README's `research → paper → live` pipeline with *"real capital only after months
of live paper-trading evidence"* is the stated reason this file exists, and it is the
single strongest signal of engineering maturity in the repository.

### How it works — the state machine

Persisted in `results/paper_state.json`:

```json
{
  "accounts": { "NIFTYBEES": {"cash": 20000, "units": 0.0, "entry": null}, ... },
  "pending":  { "NIFTYBEES": "BUY", "HDFCBANK": "BUY" },
  "last_candle": "2026-07-17"
}
```

Each nightly run:

1. **Fetch** one year of daily bars for all five symbols ([`:41-48`](paper_bot.py#L41)).
2. **Idempotency gate** ([`:50-54`](paper_bot.py#L50)): if the newest candle date equals
   `last_candle`, print and `raise SystemExit`. *Why:* running twice on a holiday would
   otherwise execute the pending order twice against the same bar. This is the
   difference between a script and a system.
3. **Execute yesterday's pending order at today's real open** ([`:64-78`](paper_bot.py#L64)).
   Exactly mirrors [`src/backtest.py:31-49`](src/backtest.py#L31), including the
   `(1 - COST_PER_SIDE)` on both sides.
4. **Compute tonight's decision → tomorrow's pending order** ([`:80-88`](paper_bot.py#L80)).
5. **Mark to market, log, persist** ([`:90-104`](paper_bot.py#L90)).

The pending-order dictionary is the crucial design element: **the no-look-ahead rule is
enforced across process restarts, by the filesystem.** The decision physically cannot be
acted on in the same run that produced it.

### Design decisions worth naming

**Why NIFTYBEES instead of the NIFTY index?** You cannot buy an index. NIFTYBEES is the
liquid ETF that tracks it and is purchasable in a real Zerodha account. The moment the
project stepped from research into simulated execution, the instrument had to become
something that actually exists. That substitution is the paper stage doing its job on
day one.

**Why five independent ₹20,000 sleeves with no rebalancing between them?** Each symbol
is an isolated experiment; a winner cannot subsidise a loser, and per-symbol
attribution is exact. A shared pool would let one strong name mask four failures. The
cost is that capital sits idle in a sleeve whose symbol is out of the market, which no
real portfolio manager would tolerate — but measurement clarity is the priority at this
stage.

**Why no stops in the bot, when the engine supports them?** Because
[`test_risk.py`](test_risk.py) showed stops made this specific strategy worse. The bot
trades **exactly** the configuration the lab validated — nothing more. Resisting the
urge to add an untested "safety" feature to a live system is precisely right.

**Why re-implement EMA inline** ([`:82-83`](paper_bot.py#L82)) **instead of importing
`add_ema`?** The bot works with a raw yfinance frame (capitalised `Close`, DatetimeIndex)
rather than the canonical loader output, so the shared function does not fit without a
conversion. The duplication is small, but it is duplication of the project's most
formula-sensitive line, and the two copies could drift.

### Consequences and failure modes

- **Missed runs execute stale orders silently.** If you skip a week, the pending `BUY`
  from last Monday fills at *this* Monday's open with no warning. The state carries the
  order but not its age. **This is the highest-severity issue in the bot** — see finding
  [F-4](#f-4--paper-bot-executes-stale-pending-orders-with-no-age-check). The live state
  file right now holds two pending BUYs against `last_candle: 2026-07-17`, roughly a
  month before this document's date.
- **`period="1y"` gives ~250 bars**, so the bot's EMAs are seeded from a one-year window
  while the backtester's are seeded from full history. With `adjust=False` an EMA(50)
  converges within a few hundred bars, so the practical divergence is small — but it is
  a real difference between the researched strategy and the traded one.
- **Partial fetch failures leave orders stranded.** A skipped symbol keeps its pending
  order for the next run, which is reasonable, but combines badly with the missing age
  check.
- **No dividend or corporate-action handling** in the paper account.
- The equity `TOTAL` row is appended to the diary on every run, so
  `results/paper_diary.csv` doubles as the equity time series. Currently it holds a
  single row: `2026-07-17,TOTAL,EQUITY,100000.0,+0.00% since start` — **the bot has run
  exactly once and has not yet filled a single order.** The paper stage is genuinely at
  day zero, which matches the README's "paper stage: in progress".

---

## 17. Results artifacts

### `results/leaderboard.csv`

Ten columns: `name, return_pct, bh_pct, margin, max_dd, trades, win_rate, verdict, bh_dd, final`.

**Current contents reveal the file's own history.** The first six rows have **empty**
`bh_dd` and `final` — they were written by `run_experiments.py` against an older
`metrics.report()` that did not yet return those fields. The last three rows, written
later by `server.py`, have them. `pd.concat` of an old frame and a new row fills the
gap with `NaN`. Nothing is corrupted, but the file is a schema-migration record: **it
is a real research diary, complete with the archaeology of its own evolution.** Nothing
in the code will ever backfill those cells.

The two naming conventions (`... on NIFTY_10Y` from the batch runner vs `... · NIFTY_10Y`
from the API) sit side by side as rows 2 and 9 with identical numbers — the duplicate
predicted in [§15.1](#151-serverpy--fastapi-backend).

### `results/paper_state.json`
The bot's entire memory. Small enough to read by eye, which is a deliberate benefit of
JSON over a database: you can debug the bot by opening the file.

### `results/paper_diary.csv`
Append-only (`mode="a"`, header written only if the file does not exist). Never
rewritten, so history cannot be lost to a bug in a later run. The right choice for an
audit log.

**All three are committed to git.** For `leaderboard.csv` that is arguably correct — the
research diary belongs in history. For `paper_state.json`, a file that mutates every
single day, it guarantees a dirty working tree forever. Splitting durable results from
runtime state would be the cleaner arrangement.

---

## 18. Testing strategy

### What exists

Four scripts, all of which **print and none of which assert**:

| File | What it actually verifies | How you know it passed |
|---|---|---|
| `test_loader.py` | All three dialects parse; row counts and date ranges are sane | You read the four lines of output |
| `test_indicators.py` | EMA/SMA columns populate; prints today's live signal | You read the numbers |
| `test_backtest.py` | The full pipeline runs end to end | You read the verdict block |
| `test_risk.py` | Four stop configurations, with a `stops fired` count | You compare four printed blocks |

### The honest characterisation

These are **executable documentation and smoke checks**, not tests. Nothing fails.
`python3 test_backtest.py` exits 0 whether the return is +184.8% or −99%. There is no
runner, no assertion, no CI, and the `test_` prefix means `pytest` would collect them,
import them, execute their module-level side effects, and report zero tests.

**Why this is defensible at this stage:** for a solo research project, the output
*is* the check, and every one of these scripts genuinely runs the real code against
real data — which is more than many projects' unit tests do. `test_risk.py` in
particular is a well-designed comparative experiment.

**Why it must change before real money:** the paper bot places orders. The moment
`paper_bot.py` is pointed at a broker API, "I eyeballed the output" stops being an
acceptable standard. The specific tests the codebase most needs are the ones that pin
the invariants this document has been describing:

```python
def test_no_lookahead():
    """A position that turns on at bar i must fill at open[i+1], never at close[i]."""

def test_cost_is_charged_on_both_sides():
    """One round trip on flat prices must lose exactly 2 × COST_PER_SIDE."""

def test_stop_never_adds_a_round_trip():
    """The `blocked` invariant: trade count must not increase when a stop is enabled."""

def test_nan_warmup_forces_flat():
    """position must be 0 wherever an indicator column is NaN."""

def test_loader_dialects():
    """All three dialects produce the identical 6-column schema and dtypes."""

def test_gold_is_rescaled():
    """XAUUSD closes must be in the hundreds-to-thousands range, not the hundred-thousands."""
```

Each of these is 3–8 lines against a tiny synthetic frame, and together they would lock
down every claim the README makes about methodology.

---

## 19. Reproducibility and environment

### Declared dependencies (`requirements.txt`)

```
pandas
yfinance
scikit-learn
fastapi
uvicorn
```

### Actual requirements

| Requirement | Source | Status |
|---|---|---|
| **pandas ≥ 2.0** | `format="mixed"` at [`src/data_loader.py:43`](src/data_loader.py#L43) | **Unrecorded hard minimum** |
| `requests` | [`server.py:59`](server.py#L59) | **Missing** — satisfied only transitively via yfinance |
| `numpy` | transitive via pandas | Fine |
| Python 3.13 | `__pycache__/*.cpython-313.pyc`, notebook kernel 3.13.5 | The version the author used |

**No version is pinned.** For a project whose central claim is *"all reproducible from
this repo's data"*, unpinned dependencies are the weakest link: a pandas 3.0 that
changes `to_datetime` inference, or a yfinance release that changes column names, breaks
reproducibility silently. Data is frozen in git; the code that reads it is not.

### The import-path constraint

There is no `src/__init__.py` and no `pyproject.toml`. `src` resolves as a PEP 420
implicit namespace package, which works **only** when the process's working directory is
the repository root (so that `''`/CWD is on `sys.path`). Consequences:

- Every script must be run from the repo root. `python3 ../trading-lab/run_ml.py` fails
  with `ModuleNotFoundError: No module named 'src'`.
- `uvicorn server:app` must also be launched from the root — doubly so, because
  `StaticFiles(directory="web")` is CWD-relative.
- The package cannot be `pip install -e .`'d, imported from a notebook elsewhere, or
  used as a library.

Adding a five-line `pyproject.toml` and an empty `src/__init__.py` would remove this
constraint entirely.

### Environment as found on this machine

`python3` on `PATH` is **3.9.6** (Apple Command Line Tools) with **none** of the five
dependencies installed. The 3.13 interpreter that produced the cached bytecode is not
on `PATH`. Verification for this document was therefore performed in a clean virtual
environment with `pandas 2.3.3`; the pure-pandas pipeline
(`test_loader`, `test_indicators`, `test_backtest`, `test_risk`) reproduced the
repository's published numbers exactly. `run_ml.py` (needs scikit-learn), `server.py`
and `paper_bot.py` (need fastapi/yfinance and network access) were **not** executed, and
their figures in this document are taken from the README and
`results/leaderboard.csv` rather than re-verified.

---

## 20. Verified results

Everything in this section was re-executed against the current repository.

### 20.1 Loader — all three dialects

```
NIFTY_10Y.csv        2,463 candles | 2016-07-18 -> 2026-07-16 | last close = 24,119.20
NIFTY50d1.csv        4,619 candles | 2007-09-17 -> 2026-07-17 | last close = 24,334.30
XAUUSDd1.csv         2,400 candles | 2012-11-14 -> 2022-03-04 | last close =  1,969.74
XAUUSDm15.csv      230,400 candles | 2012-05-15 -> 2022-03-04 | last close =  1,969.74
```

Gold rescaling confirmed (1,969.74 not 196,974). Dayfirst parsing on `XAUUSDm15.csv`
confirmed (`15-05-2012` → 2012-05-15). Zero rows lost to `dropna`.

### 20.2 The headline experiment

```
===== EMA 20/50 crossover on NIFTY 50 =====
Strategy return :   +184.8%   (final Rs 284,773)
Buy & hold      :   +181.6%   <- the score to beat
Worst fall      :    -15.1%   (buy & hold fell -38.4%)
Trades          :    16 closed, win rate 81%
VERDICT         : WEAK EDGE - real but thin, verify before trusting
```

Matches `results/leaderboard.csv` and the README exactly. The real finding is in the
third line: **essentially the same return for 39% less peak-to-trough pain.** The edge
is risk reduction, and the lab's own README says so.

### 20.3 Risk overlay study

Reproduced in full in [§10.3](#103-risk-overlays-and-the-blocked-invariant). Headline:
the 5% trailing stop cut the return from +184.8% to +93.6% **and made the worst fall
worse** (−15.1% → −16.3%), firing 12 times without changing the trade count.

### 20.4 Derived diagnostics not currently computed by the lab

| Diagnostic | Value | Why it matters |
|---|---|---|
| Cost drag, EMA 20/50 NIFTY | **3.34%** of capital, compounded over 34 fills | The strategy's entire margin is +3.1 points |
| SMA-200 warm-up rows | **199** (2016-07-18 → 2017-05-10) | Strategy structurally flat while benchmark is invested |
| B&H return during that warm-up | **+9.8%** | A head start the strategy cannot compete for |
| Time in market, EMA 20/50 NIFTY | **70.5%** | 29.5% of a decade earning a modelled 0% |

---

## 21. Robustness evidence: cost sensitivity and parameter surface

This section goes one step beyond what the repository currently reports. Both studies
were run against the unmodified engine.

### 21.1 The verdict is a function of the cost assumption

EMA 20/50 on NIFTY_10Y, sweeping `COST_PER_SIDE`:

| Cost per side | Strategy | Buy & hold | Margin | Verdict |
|---:|---:|---:|---:|---|
| 0.00% | +194.3% | +181.6% | **+12.7** | BEATS |
| 0.05% | +189.5% | +181.6% | +7.9 | WEAK EDGE |
| **0.10%** *(the lab's setting)* | **+184.8%** | +181.6% | **+3.1** | **WEAK EDGE** |
| 0.15% | +180.1% | +181.6% | **−1.5** | LOSES |
| 0.20% | +175.5% | +181.6% | −6.1 | LOSES |
| 0.30% | +166.5% | +181.6% | −15.1 | LOSES |

**The verdict traverses all three tiers across a plausible range of cost assumptions,
and it flips from positive to negative between 0.10% and 0.15%.** Since 0.15% all-in is
entirely realistic once slippage and market impact are included alongside brokerage and
statutory charges, the honest statement is: *the measured edge of the lab's best
strategy is smaller than the uncertainty in the lab's own cost parameter.*

This does not contradict the repository — it **confirms** the wisdom of the `WEAK EDGE`
tier's instruction to "verify before trusting". It does mean the sensitivity table
belongs in the leaderboard, not only in this document.

### 21.2 The parameter surface is not robust

Full grid of EMA fast/slow on the same 10 years of NIFTY_10Y, at the standard 0.1% cost.
Cells are **margin vs buy & hold in percentage points**:

| fast \ slow | 40 | 50 | 60 | 80 | 100 | 150 |
|---:|---:|---:|---:|---:|---:|---:|
| **5** | −70 | −83 | −65 | −83 | −76 | −60 |
| **10** | −63 | −55 | −58 | −39 | −30 | −58 |
| **15** | −22 | −25 | −27 | −36 | −63 | −73 |
| **20** | **+3** | **+3** | **+13** | −58 | −70 | −73 |
| **25** | −21 | **+13** | −32 | −30 | −75 | −83 |
| **30** | −2 | −22 | −58 | −32 | −101 | −99 |

**Only 4 of 36 parameter combinations beat buy & hold at all**, and the positive cells
do not form a contiguous plateau — `25/50` scores +13 while its immediate neighbours
`25/40` and `25/60` score −21 and −32. A genuine edge produces a broad, smooth region
of positive results, because a real market effect does not care whether you use a
50-day or a 55-day average. **An isolated spike surrounded by losses is the
fingerprint of curve-fitting.**

Note also that `20/60` and `25/50` both score +13, which would earn the `BEATS buy &
hold` label. Selecting either of them *after* seeing this grid and reporting it as a
discovery would be textbook backtest overfitting — precisely what the Bailey et al.
reference in the README warns against. The repository's decision to report the
canonical 20/50 rather than the best cell is, in retrospect, the correct one; it just
was not an explicit decision, and nothing in the code prevents the mistake next time.

**Recommendation:** make both studies first-class outputs. A `run_robustness.py` that
emits the cost-sensitivity row and the parameter-surface grid for any candidate
strategy would turn the lab's core discipline — distrust your own good news — from a
cultural norm into a piece of software.

---

## 22. Senior engineering review — findings

Ranked by consequence. Each is an observation about this specific code, with the
evidence and the smallest fix that resolves it.

### F-1 — Two writers with incompatible policies on `results/leaderboard.csv`
**Severity: high (silent data loss)**
[`run_experiments.py:39`](run_experiments.py#L39) overwrites the file wholesale;
[`server.py:110-114`](server.py#L110) merges into it. Running the batch runner after a
web session **deletes every result the UI accumulated**. There is no locking either, so
two concurrent `/api/backtest` calls can lose a row to a read-modify-write race.
*Fix:* extract one `save_result(row)` helper in `src/metrics.py` implementing the
merge-and-dedupe policy, and have both writers call it. Give the row a composite
identity (`file`, `kind`, `fast`, `slow`, `trailing`) instead of the display string,
which also removes the `on` / `·` duplicate visible in the current file.

### F-2 — Warm-up asymmetry: the benchmark gets a free head start
**Severity: high (systematic measurement bias)**
The frame is never trimmed to the first bar at which all indicators are valid, so the
benchmark is invested during a window in which the strategy is structurally forced flat.
*Verified:* SMA 50/200 on NIFTY_10Y has 199 such rows, during which buy & hold earns
**+9.8%**. The bias scales with lookback length, so the lab penalises slow indicators
for a mechanical reason unrelated to their merit — which materially affects the
`SMA 50/200 → LOSES` conclusion in the README.
*Fix:* in `report()`, start the benchmark curve at the first row where `position` is
computable — one line: `start = df["position"].first_valid_index()` after dropping
indicator NaNs, then build `bh_curve` from `df["open"].iloc[start]`.

### F-3 — `run_ml.py` is a single holdout split, not walk-forward validation
**Severity: medium (documentation/claim mismatch)**
Both the README and [`run_ml.py:1-3`](run_ml.py#L1) say "walk-forward". The code does one
70/30 chronological split. The result is still honest; the label overstates the
protocol, and a reader familiar with the term will expect rolling retraining.
*Fix:* either rename it "chronological holdout" in both places, or implement the real
thing — a loop over expanding train windows with fixed-length test segments, which is
~15 lines and would also reveal whether the model's edge is stable across regimes.

### F-4 — Paper bot executes stale pending orders with no age check
**Severity: medium (correctness in the one component that will touch real money)**
`state["pending"]` records *what* to do but not *when* it was decided. Skip a week and
last week's `BUY` fills at today's open, silently, on a signal that may have long since
reversed. The live state file currently holds two pending BUYs stamped `2026-07-17`.
*Fix:* store `{"action": "BUY", "decided_on": "2026-07-17"}` and refuse to execute if
`decided_on` is not the immediately preceding trading day — log a skip and recompute
from scratch instead.

### F-5 — Gold price rescaling is keyed on the filename
**Severity: medium (silent data corruption if violated)**
[`src/data_loader.py:33-36`](src/data_loader.py#L33) divides OHLC by 100 whenever
`"XAUUSD"` appears in the filename. A future gold file already in dollars would be
divided by 100 and produce entirely wrong, entirely plausible-looking results.
*Fix:* move the scale factor into an explicit registry
(`SCALE = {"XAUUSDd1.csv": 0.01, ...}`) or, better, add a magnitude sanity check —
gold above 50,000 is not a price, it is a unit error.

### F-6 — `load_csv` silently picks the first of several matches
**Severity: low–medium**
[`src/data_loader.py:10-13`](src/data_loader.py#L10) returns `matches[0]` from an
`rglob`, whose ordering is filesystem-dependent. Two same-named files in different
subfolders resolve arbitrarily and non-reproducibly.
*Fix:* `if len(matches) > 1: raise ValueError(f"ambiguous filename {filename}: {matches}")`.
One line, and it converts a silent wrong answer into a loud one.

### F-7 — No input validation on the DataFrame contract
**Severity: low–medium**
Nothing checks that `position ∈ {0,1}`, that `date` is monotonically increasing, that
prices are positive, or that `high ≥ low`. `run_ml.py` writes `position` directly from
model output; a model returning `-1` or `2` would produce a nonsensical but entirely
silent backtest.
*Fix:* a six-line `assert_contract(df)` called at the top of `run_backtest`. Cheap, and
it protects every consumer including future ones.

### F-8 — `COST_PER_SIDE` is imported by value and cannot be overridden
**Severity: low (but it blocks the most valuable study)**
`from src.config import COST_PER_SIDE` binds the float at import time, so rebinding the
config attribute has no effect on the engine. Any cost-sensitivity analysis must patch
`src.backtest` directly — as §21 had to.
*Fix:* make it a parameter: `def run_backtest(df, ..., cost=COST_PER_SIDE)`. Backward
compatible, and it makes the sensitivity study a two-line loop.

### F-9 — `/api/add` writes a filename derived from unsanitised user input
**Severity: low in the intended deployment, high if ever exposed**
[`server.py:92-94`](server.py#L92) strips `.NS`, `.BO`, `^` and `&` from the symbol and
uses the remainder as a filename. Path separators and `..` are not stripped. In practice
an exploit path must first survive a yfinance lookup that returns data, which makes this
very hard to trigger — but the endpoint is an unauthenticated `GET` that writes to disk,
and the only thing keeping it safe is that it is bound to localhost.
*Fix:* whitelist `[A-Z0-9_-]` and reject anything else; make it `POST`; keep the bind
address on `127.0.0.1`.

### F-10 — Verdict thresholds are duplicated across three files
**Severity: low (drift risk)**
The `>10` / `>0` boundaries live in [`src/metrics.py:25-30`](src/metrics.py#L25),
[`web/index.html:567`](web/index.html#L567) and [`:619`](web/index.html#L619).
*Fix:* have the API return the tier name (`win`/`weak`/`lose`) alongside the verdict
text, and let the client use it.

### F-11 — `margin` is not horizon-normalised, but the leaderboard is one sorted list
**Severity: low as used today, high the moment someone compares rows**
Ten points over 10 years and ten points over 30 years are ranked identically.
*Fix:* add `years`, `cagr` and `bh_cagr` columns; threshold the verdict on annualised
excess return.

### F-12 — Repository hygiene
**Severity: cosmetic**
- `test_...py files` — a 0-byte tracked file from a mistyped `touch`. Delete it.
- `Untitled.ipynb` — an empty notebook with one empty cell. Delete it.
- `strategies/` — an empty, untracked directory from an abandoned design. Delete it, or
  add a `README` explaining why it is reserved.
- **Every tracked file's mode changed from `100644` to `100755`** — see
  [Appendix B](#appendix-b--working-tree-state). 59 files show as modified with zero
  content change, which makes `git status` useless for spotting real work.
  Fix: `chmod -R a-x` on the non-executable files, or `git config core.fileMode false`.

### What is genuinely well done

It would be a poor review that listed only faults. These decisions are better than what
most production quant code gets right:

- **The one-bar delay is structural, not remembered.** [`src/backtest.py:25`](src/backtest.py#L25).
- **Stops fill at the next open, not at the stop price.** The engine deliberately
  declines to use `high`/`low` for intrabar fills, and therefore eats the gap.
- **The `blocked` invariant** makes a stop a pure exit-timing modifier — verified to
  leave the trade count unchanged at 16 across all four configurations.
- **The `elif` structure** makes a same-bar exit-and-re-entry unrepresentable.
- **The `i > 0` guard** correctly defuses pandas' negative-index semantics, which would
  otherwise be a catastrophic look-ahead bug.
- **Open trades are shown but excluded from win rate** — a discipline many commercial
  backtesters get wrong.
- **The judge is decoupled from the strategy**, which is why a RandomForest and a
  moving-average crossover are scored by byte-identical code.
- **Every run is recorded automatically.** You cannot quietly forget a failure.
- **The three-tier verdict names the dangerous middle case** and instructs the reader to
  distrust it.
- **The UI shows its assumptions on the same screen as its results**, and marks stale
  data as historical so it cannot be mistaken for a live quote.
- **The paper bot trades the validated configuration and nothing more** — no untested
  "safety" features added on the way to production.

---

## 23. What the lab deliberately does not model

Stated plainly, because a research tool's credibility depends on the reader knowing its
boundaries. Roughly in order of how much each would change the numbers:

| Not modelled | Direction of bias | Notes |
|---|---|---|
| Dividends | **Favours strategy** | `auto_adjust=False` keeps raw Close; B&H's true total return is higher |
| Interest on idle cash | Favours benchmark | Out-of-market cash earns a modelled 0%; real T-bills earned 4–7% |
| Indicator warm-up trimming | Favours benchmark | Verified +9.8% head start on SMA 50/200 |
| Slippage and market impact | Favours strategy | Folded into the single 0.1%; a large order moves the price |
| Benchmark transaction cost | Favours benchmark | B&H pays nothing, not even one entry fill |
| Whole-share lot sizes | Favours strategy | Fractional units assumed |
| Intraday stop fills | Favours benchmark | Deliberately conservative; the engine eats the gap |
| Short selling | Neutral | Out of scope by design ([§9](#9-layer-4--signals-srcsignalspy)) |
| Leverage, margin, F&O | Neutral | Out of scope |
| Taxation (STCG/LTCG) | **Favours strategy heavily** | A 16-trade strategy realises gains annually; B&H defers for a decade. At Indian STCG rates this alone could exceed the entire +3.1 point margin |
| Liquidity limits | Favours strategy | Assumes any size fills at the open |
| Survivorship / selection bias in the universe | Varies | Today's mega-caps chosen with hindsight ([§14.3](#143-run_momentumpy--cross-sectional-momentum)) |
| Corporate actions beyond splits | Small | Bonuses, demergers, symbol changes |
| Multiple-testing correction | **Favours strategy** | 36 grid cells tested in §21; no Bonferroni, no deflated Sharpe |

**The most under-appreciated entry in this table is taxation.** The lab's flagship
result is a +3.1 point margin over ten years. A strategy that closes 16 taxable
positions over that decade against a benchmark that closes none would very plausibly
give back more than 3.1 points to the tax authority. **On an after-tax basis, the lab's
single "weak edge" is most likely a loss** — while its genuine finding, the 39%
reduction in drawdown, is entirely unaffected by tax. That reinforces rather than
undermines the README's own conclusion that "the edge is safety, not return."

---

## 24. Roadmap and sequencing rationale

The README lists three items. Below, each is placed in the order this review would
actually do them, with the reasoning.

**Already stated in the README:**
1. Search-any-stock with auto-download — *shipped*, as `/api/search` + `/api/add`.
   The README's roadmap is behind the code.
2. Momentum re-test on a 50-stock NIFTY universe.
3. Broker API integration (Zerodha) — explicitly gated on paper-trading success.

**Recommended sequencing, highest value first:**

| # | Work | Why now |
|---|---|---|
| 1 | Fix **F-1** (leaderboard writers) and **F-2** (warm-up trim) | F-1 loses data every time the batch runner is used; F-2 changes published conclusions. Both are small and both affect results already in the README. |
| 2 | Add the six invariant tests from [§18](#18-testing-strategy) | They lock down every methodological claim the project makes, before any refactor can quietly break one. |
| 3 | Fix **F-4** (stale pending orders) | The paper bot is the only component on a path to real money. |
| 4 | Add CAGR, exposure %, and Sharpe to `report()` | Turns the project's best qualitative finding ("the edge is safety") into a number, and fixes **F-11** on the way. |
| 5 | Ship `run_robustness.py` — cost sweep + parameter grid ([§21](#21-robustness-evidence-cost-sensitivity-and-parameter-surface)) | Makes the lab's core discipline executable. This is the highest-leverage *new* feature in the list. |
| 6 | Momentum on a 50-stock universe | The existing test's stated conclusion is that the universe was too narrow — so widening it is the designed next experiment. Fix the turnover-cost approximation while you are in there. |
| 7 | Real walk-forward for the ML experiment (**F-3**) | Rolling retrain reveals whether the tiny edge is stable across regimes or an artefact of one. |
| 8 | `pyproject.toml` + `src/__init__.py` + pinned versions | Removes the CWD constraint and makes "all reproducible from this repo" actually true. |
| 9 | Intraday research on the 30 unused files | The pipeline already supports it; only bar-count-based assumptions need review. |
| 10 | Broker integration | Correctly last, and correctly gated on months of paper evidence. |

**The one thing to resist:** adding more strategies before the measurement layer is
fixed. Every new strategy scored under F-2's warm-up bias and F-11's un-normalised
margin produces another row of subtly wrong conclusions. **Fix the ruler before
measuring more things.**

---

## 25. Glossary

| Term | Meaning in this codebase |
|---|---|
| **Bar / candle** | One row of `data/*.csv`: an OHLCV observation over one timeframe |
| **`position`** | The binary column produced by `signals`: 1 = invested, 0 = in cash |
| **Fill** | A simulated execution, always at a bar's `open`, always paying `COST_PER_SIDE` |
| **Equity curve** | `df["equity"]` — portfolio value marked to each bar's close |
| **Buy & hold (B&H)** | Buy at the first bar's open, hold to the last close, pay nothing |
| **Margin** | `strategy_return_pct − buy_and_hold_return_pct`, in percentage points. The primary score |
| **Max drawdown** | Largest peak-to-trough fall of the equity curve, as a percentage |
| **Look-ahead bias** | Using information not yet available at decision time. The thing this engine is built to prevent |
| **Walk-forward** | Repeatedly train on the past, test on the immediate future, slide forward. *Claimed* by `run_ml.py`; not what it implements |
| **Warm-up** | Leading bars where an indicator is `NaN` and the strategy is forced flat |
| **`blocked`** | Engine flag preventing re-entry after a stop-out until the signal resets to 0 |
| **Weak edge** | Verdict tier for `0 < margin ≤ 10` — positive but inside the noise |
| **NIFTYBEES** | The ETF the paper bot trades because you cannot buy an index |
| **Dialect A/B/C** | The three CSV formats `data_loader` detects: Yahoo multi-header / MetaTrader / plain |

---

## Appendix A — Exact reproduction commands

All commands must be run **from the repository root**.

Install dependencies (add `requests`, which is missing from the file):

```bash
pip3 install -r requirements.txt requests
```

Verify the data pipeline across all three CSV dialects:

```bash
python3 test_loader.py
```

Reproduce the headline result:

```bash
python3 test_backtest.py
```

Reproduce the risk-overlay study:

```bash
python3 test_risk.py
```

Rebuild the leaderboard from the six batch experiments — **note: this overwrites
`results/leaderboard.csv`, discarding rows added by the web UI (finding F-1)**:

```bash
python3 run_experiments.py
```

Run the machine-learning experiment:

```bash
python3 run_ml.py
```

Run the cross-sectional momentum experiment:

```bash
python3 run_momentum.py
```

Refresh Indian daily data from Yahoo (rewrites 6 tracked CSVs):

```bash
python3 fetch_data.py
```

Start the web workbench at http://localhost:8000:

```bash
python3 -m uvicorn server:app --reload
```

Run one paper-trading session (intended for after market close):

```bash
python3 paper_bot.py
```

---

## Appendix B — Working-tree state

At the time of writing, `git status` reports **59 modified files** against the single
commit `6ce8592 "Initial commit"`. This is almost entirely noise:

- **57 files: mode change only.** `git diff --summary` reports
  `mode change 100644 => 100755` with **zero** content lines changed. Something
  (a `chmod -R`, or a copy through a FAT/exFAT volume) set the execute bit on every
  tracked file. With `core.fileMode = true`, git faithfully reports all of them.
- **2 files with real content changes:**
  - `.gitignore` — a single trailing space added after `.vscode/`.
  - `results/leaderboard.csv` — one row reordered, which is exactly the expected
    footprint of `server.py`'s `drop_duplicates(keep="last")` after a web-UI backtest
    re-ran an existing configuration.

**Why this matters:** a working tree that is permanently dirty for cosmetic reasons
destroys the usefulness of `git status` and `git diff` as review tools — real changes
become invisible in the noise. Resolve it before the next commit:

```bash
git config core.fileMode false
```

That tells git to ignore the execute bit in this repository. To actually normalise the
permissions instead:

```bash
chmod -R a-x,u+rwX,go-rwx . && chmod u+x $(git ls-files '*.py')
```

---

*Document generated 2026-08-19 against commit `6ce8592`. Every quantitative claim in
§20 and §21 was produced by executing the repository's own code, unmodified except for
the cost parameter in §21.1, in a clean pandas 2.3.3 environment.*
