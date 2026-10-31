# About Me: Ramnath Thakur (Rama)

**Media.net R2 Interview Prep**

## Contents

1. [Self Introduction](#1-self-introduction)
2. [Foomato ML Internship: Complete Case File](#2-foomato-ml-internship-complete-case-file)

---

## 1. Self Introduction

*Spoken, about 60 to 75 seconds.*

Hi, I'm Ramnath, most people call me Rama. I'm a final-year Computer Science student at NIT Rourkela, graduating in 2027, and I'm originally from Nepal.

This summer I interned on the ML team at Foomato, a food delivery app in Nepal. I was in a three-person pod. I owned the homepage feed ranker, a LightFM hybrid recommender trained on about 200K historical orders, and I contributed to an XGBoost model that predicts delivery time at checkout.

Outside the internship, I like building systems end to end, from the backend logic to the interface people actually use. Two projects I'd point to are Howzat and PaperCode.

Howzat is a live, realtime cricket scoring platform. Every ball is stored as an immutable event in Postgres, and scores and standings are rebuilt from that log, with Redis snapshots and Socket.IO pushing live updates. The scorer's console also works offline and syncs safely when the connection comes back.

PaperCode is a terminal-based AI coding agent I published on npm. It works with multiple model providers and has separate plan and build modes.

That's a quick overview of me. I'm happy to go deeper into any of these.

---

## 2. Foomato ML Internship: Complete Case File

**Ramnath Thakur (Rama)** · ML Engineering Intern · Foomato Pvt. Ltd., Janakpur, Nepal
**Duration:** 3 May 2026 to 19 July 2026 (11 weeks)
**Team:** 3-person ML pod · Mentor: Shiwam Sah
**Scale:** ~20K monthly active users · ~200K historical orders
**Stack:** Python, pandas, NumPy, SciPy (sparse matrices), scikit-learn, LightFM, XGBoost

---

### 2.1 The one-minute version

Foomato is a food delivery app in Nepal. It had about 200K orders sitting in its logs and used none of them on the two surfaces that cost it money: a homepage that showed every user the same list of restaurants, and a checkout ETA that said "45 minutes" for everything.

I owned the homepage feed. It is a two-stage system: hard serviceability rules decide which restaurants can deliver to you right now, and a **LightFM hybrid recommender** ranks what is left using your order history plus user and restaurant features. I also contributed to the **XGBoost ETA model** that predicts total delivery minutes at checkout from 10 features known at that moment.

Both models were trained on a time-based split, cancelled orders were treated differently in each, and cold start was built as a real serving path, not an afterthought.

```
                 ┌──────────────────────────────┐
                 │   ORDER + EVENT LOGS (~200K) │
                 └───────────────┬──────────────┘
                                 │
             ┌───────────────────┴────────────────────┐
             ▼                                        ▼
   ┌───────────────────────┐            ┌──────────────────────────┐
   │  HOME FEED            │            │  ETA PREDICTION          │
   │  (my ownership)       │            │  (pod contribution)      │
   │  serviceability rules │            │  XGBoost regression      │
   │  + LightFM ranker     │            │  10 checkout features    │
   │  13 features          │            │  -> total minutes        │
   └──────────┬────────────┘            └─────────────┬────────────┘
              ▼                                       ▼
      ranked restaurant list              checkout + tracking estimate
```

---

### 2.2 Ownership (say this exactly, never inflate it)

| Area | What it covered | My role |
|---|---|---|
| Homepage feed ranker | features, LightFM training, offline eval, cold-start fallback | **Primary owner** |
| ETA model | features, training, leakage review | **Contributor** |
| Order-log cleaning + feature tables | split across the pod | **Shared** |
| Serving design | nightly feed cache, live ETA feature fetch | **Designed with the pod** |

> "I owned training for the feed ranker. I contributed to the ETA model. The data pipeline was shared."

---

### 2.3 Why the work existed

#### Problem 1: the homepage was a flat list
Everyone in a city saw the same restaurants, sorted by popularity, alphabet, or whoever paid for placement. People scrolled, bounced to search, or reordered from the same three places. At this scale the homepage *is* the product. Swiggy says the same thing publicly: feed quality and conversion move together, which is why they track NDCG, ordered-click depth, share of orders from the top of the feed, and search fallback rate.

#### Problem 2: the ETA was a constant
Checkout showed 45 minutes for everything, or distance times a fixed speed. The cost is two-sided:

```
  shown too SLOW (overestimate)          shown too FAST (underestimate)
  -----------------------------          ------------------------------
  user abandons checkout                 food arrives late
  lost conversion                        1-star rating, refund, support ticket
```

There is no safe side to be wrong on, which is why Uber, DoorDash, Swiggy and Zomato all treat ETA as a first-class model.

Neither problem was research. Both were "we have logs and never used them."

---

### 2.4 The data layer (where most of the 11 weeks went)

#### Raw order table
```
ORDERS (~200,000 rows)
  order_id, user_id, vendor_id, rider_id
  placed_at, accepted_at, picked_up_at, delivered_at
  items[], order_value, payment_mode
  user_lat/lng, vendor_lat/lng
  status: delivered | cancelled | rejected
```

#### Cleaning decisions (each one changes a model)

| Issue | ETA model | Feed model | Why |
|---|---|---|---|
| Cancelled / rejected orders | **drop** | **keep as weak signal** | ETA has no true delivery time if the order never finished. For the feed, a cancel can mean rider shortage, price shock, or a change of mind, so treating it as a hard negative would poison cuisine affinity. |
| Timestamp artifacts (<5 min or >120 min) | clip or drop | n/a | Riders sometimes mark delivered late or in a batch. A 2-minute delivery is a logging bug. |
| Test and staff accounts | blacklist | blacklist | They order from everywhere at odd hours with no price sensitivity and would dominate the collaborative signal. Removed before any feature is computed. |
| Vendor churn (closed restaurants) | keep | keep in training, filter at serve time | A restaurant that closed still teaches the model what lunch momos in that area look like. Availability is a serve-time rule. |
| Broken timestamp order (delivered before picked up, null accepted_at) | drop | keep with a flag | The label is broken but the order is real. |

#### The split: time-based, never random

```
  train: May 2025 ─────────────────────────── Mar 2026 │ val: Apr 2026 │ test: May-Jun 2026
                                                       ▲
                                    feature cutoff: trailing 30-day stats stop here

  WRONG: random 80/20 shuffle -> June behaviour leaks into April scores
```

A random shuffle lets the model see the future while being scored on the past. Taste drifts, new vendors open, monsoon traffic starts, festivals hit. The offline number looks great and production is worse. So:
- No user, vendor or session that exists only in the future enters training features.
- Trailing 30-day popularity is computed with a cutoff at the last training timestamp, not over the last 30 days of the whole dump.

---

### 2.5 System A: Personalised home feed (my ownership)

#### 2.5.1 Framing: rules retrieve, the model ranks

The feed is not "predict what the user wants to eat." If you merge business rules into the model, it spends its capacity learning that closed restaurants are bad, which a boolean already knows. So it is a two-stage funnel, the same shape Uber Eats calls first-pass retrieval and second-pass ranking, and Swiggy describes in its feed posts. We built the small-city version.

```
  every vendor in the city (~400)
              │
              ▼
  ┌─────────────────────────────────┐
  │ STAGE 1: serviceability (rules) │   open right now
  │ no ML                           │   inside delivery radius
  │                                 │   riders available in zone
  │                                 │   not churned / not blocked
  └───────────────┬─────────────────┘
                  ▼
           40 to 60 candidates
                  │
                  ▼
  ┌─────────────────────────────────┐
  │ STAGE 2: LightFM ranker         │   this user, this hour
  │ + serve-time adjustments        │
  └───────────────┬─────────────────┘
                  ▼
        ~10 cards + 1 exploration slot
```

At Uber's scale, stage 1 is a two-tower model with an ANN index over millions of stores. At a few hundred vendors per city, a rule filter is the correct system, not a smaller copy of theirs.

#### 2.5.2 Why LightFM

LightFM is a **hybrid matrix factorisation** model. Every user and every restaurant is represented as the **sum of the embeddings of its features**, and the score is a dot product.

```
  user_vec = emb(user_id) + emb(freq_high) + emb(price_band_2) + emb(likes_momo) + ...
  item_vec = emb(vendor_id) + emb(cuisine_momo) + emb(price_band_2) + emb(zone_9) + ...

  score(u, i) = user_vec · item_vec + b_u + b_i
```

Why this and not the alternatives:

| Option | Problem at Foomato |
|---|---|
| Pure matrix factorisation (ALS / SVD) | One embedding per ID only. Cannot use side features. A new restaurant with zero orders is never recommended. A new user has nothing to factorise. |
| Pure content-based | Ignores the strongest signal we had: who actually ordered where. |
| Two-tower / deep model | Needs far more data and an online serving path. Overkill for 20K MAU and a few hundred vendors. |
| **LightFM (hybrid)** | Collaborative signal from the interaction matrix **and** side features in one model. Cold start degrades gracefully. Trains fast on CPU, sparse inputs, small pod can operate it. |

The key property for cold start:

```
  established vendor:  vec = emb(vendor_12) + emb(momo) + emb(price_2) + emb(zone_9)
  brand-new vendor:    vec =      ~0        + emb(momo) + emb(price_2) + emb(zone_9)
                                                └──── learned from every other momo
                                                      place in zone 9
```

The ID embedding is untrained, but the cuisine, price and zone embeddings were learned from every other similar vendor, so the new vendor gets a meaningful vector on day one. If you give each entity only its ID feature, LightFM collapses to plain MF; adding metadata is what makes it hybrid.

#### 2.5.3 The 13 features

LightFM only has slots for **user features** and **item features**. It has no slot for request-time context. So the 13 signals live in three places: user features, item features, and serve-time adjustments.

| # | Feature | Side | How it enters |
|---|---|---|---|
| 1 | Order frequency (orders/week, trailing window), bucketed | user | LightFM user feature |
| 2 | Price-band preference (from average order value) | user | LightFM user feature |
| 3 | Cuisine affinity (share of delivered orders per cuisine) | user | LightFM user feature, weighted tags |
| 4 | Repeat tendency (how often the user reorders the same vendor) | user | LightFM user feature |
| 5 | Time-of-day pattern (lunch-heavy, dinner, late-night) | user | LightFM user feature |
| 6 | Trailing-30-day order volume (popularity), bucketed | vendor | LightFM item feature |
| 7 | Rating + historical cancellation rate, bucketed | vendor | LightFM item feature |
| 8 | Vendor price band | vendor | LightFM item feature |
| 9 | Operating window (breakfast / late-night tags); live open status | vendor | item feature + stage-1 filter |
| 10 | Primary cuisine | vendor | LightFM item feature |
| 11 | Distance user to vendor (haversine) | context | zone features in model + live distance penalty at serve time |
| 12 | Hour bucket and weekday/weekend | context | serve-time meal-slot adjustment |
| 13 | User-vendor cuisine match | interaction | learned natively: dot product of user cuisine and vendor cuisine embeddings |

Continuous values (frequency, AOV, popularity, rating) were **bucketed into categorical tags** because LightFM consumes sparse indicator features. Uber uses the same trick of quantile-bucketing continuous features.

**Why 13 and not 80?** At 200K rows a wide, sparse feature set overfits the few power users. Every feature had to be computable at the training cutoff and again at serve time, from the same definition.

#### 2.5.4 Labels: implicit feedback, not ratings

We never had dense, trusted star ratings. We had orders, and orders have shades.

```
  ordered + delivered      -> strong positive, weighted by repeat + recency
  cancelled after placing  -> weak positive, low weight (they considered this vendor)
  shown, not ordered       -> not stored; handled by the ranking loss
  never shown              -> NO signal (not a negative)
```

The classic mistake is `label = 1 if ordered else 0` over the full user x vendor matrix. That teaches the model that everything it never showed you is irrelevant, so it stops surfacing anything new.

In LightFM terms:
- The **interaction matrix** (users x vendors, SciPy sparse COO) holds the positives.
- **`sample_weight`** carries the grade: delivered orders weighted up by repeat and recency, cancels kept at a small weight.
- Interaction matrices were built **per city**, so the negatives the loss samples are vendors the user could plausibly have ordered from, not restaurants in another city.

#### 2.5.5 Loss: WARP

LightFM was trained with **WARP (Weighted Approximate-Rank Pairwise)** loss.

```
  for each positive (user, vendor):
      sample negatives until one scores higher than the positive
      the fewer samples it took, the worse the rank -> bigger update
```

WARP spends its effort where the model is wrong near the top of the list. A phone shows about 10 cards before the fold, so top-K precision is all that matters. BPR (plain pairwise) is the alternative; it is faster but usually weaker at top-K.

Hyperparameters tuned on the April validation month: `no_components` (embedding size), `learning_rate`, `epochs`, and the L2 penalties `user_alpha` / `item_alpha`.

#### 2.5.6 Cold start is the main path, not an edge case

At 20K MAU, new and nearly-new users are a big share of daily sessions.

```
  NEW USER: climb the stairs
  ┌──────────────────────┐
  │ 3. personalised      │  after N = 3 delivered orders
  ├──────────────────────┤
  │ 2. popular here, now │  geo + hour popularity, distance-penalised
  ├──────────────────────┤
  │ 1. serviceability    │  open, in radius, riders available
  └──────────────────────┘
```

- **New user:** distance-filtered popularity by hour until there is history, then the personalised ranker. Never key the model on a user embedding that does not exist yet. Uber Eats wrote about the same need for a new-eater bootstrap.
- **New vendor:** no orders, so it never surfaces, so it never gets orders. Death spiral. Fix: a reserved **exploration slot (positions 4 to 6)** with a fixed impression budget, scored on content features only (cuisine, price band, zone, rating if any). LightFM's feature embeddings make this score meaningful. Uber Eats runs a multi-armed bandit here; we did not have online allocation infra.
- **New city with thin data:** do not train a collaborative model on 400 orders. Popularity + distance + hours is the whole system until density arrives.

#### 2.5.7 Diversity

Serve-time caps on cuisine and vendor group in the top 10, the exploration slot, and not letting popularity dominate so the ranker does not turn into a sorted bestseller list. Offline we watched unique vendors in the top 10 and the GMV share of the top 10 vendors.

#### 2.5.8 Evaluation: beat popularity or it is theatre

**Offline (forward time split):**
- Precision@10 and Recall@10 (K = 10 because a phone holds ~10 cards above the fold). LightFM ships `precision_at_k`, `recall_at_k` and `auc_score`.
- NDCG@10 when position matters, not just presence.
- **Baseline that must lose:** popularity-only ranking on the same serviceable set, same time split.
- Secondary: share of test orders whose vendor lands in the model's top 10 vs the popularity top 10.
- Position-bias check: where the ordered vendor sat in the new list, because slot 1 gets ordered partly because it is slot 1.

**Online metrics designed:**
- feed card CTR
- session-to-order conversion
- position of the ordered vendor
- guardrail: search usage (more searching means the feed got worse)
- guardrail: vendor concentration (top vendors should not eat even more GMV)

Result: the ranker beat the popularity baseline on the forward time split. That was the bar for leaving the notebook.

---

### 2.6 System B: ETA prediction (pod contribution)

#### 2.6.1 Define the target before any feature

```
  placed_at ──► accepted_at ──► picked_up_at ──► delivered_at
     │  accept/assign  │   prep + wait    │    transit     │
     └──────────────────────── total ETA ──────────────────┘
                        (the checkout number)
```

Industry decomposes this because prep is a restaurant property and transit is a road and rider property. Swiggy's public writing splits it into O2A (order to rider assignment), FM (first mile), WT (wait at restaurant) and LM (last mile):

```
  delivery_time ≈ max(assignment + first_mile, prep) + last_mile
                  └── dispatch and prep run in parallel, so max(), not sum ──┘
```

**What we did:** single-shot total minutes from `placed_at` to `delivered_at`. Per-leg models need clean per-leg labels and live rider GPS pings at serve time, which Foomato's logs did not have at production quality.

#### 2.6.2 The 10 features (all known at checkout)

| # | Feature |
|---|---|
| 1 | Haversine distance, vendor to user |
| 2 | Hour-of-day bucket |
| 3 | Day of week, weekend flag |
| 4 | Restaurant queue load (open orders right now) |
| 5 | Rider availability (free riders in the zone) |
| 6 | Order size (item count) |
| 7 | Order value |
| 8 | Vendor trailing-30-day average prep / delivered time |
| 9 | Zone / area id (roads and traffic proxy) |
| 10 | Peak flag (lunch 12 to 2, dinner 7 to 9) |

**Deliberately NOT used (leakage):** actual rider speed on this trip, time the restaurant took to accept this order, real pickup-to-drop minutes. At checkout you do not know which rider gets assigned or when the restaurant accepts. Those are labels or post-assignment facts. (Accept time is legal for a tracking-screen refresh, not for checkout.)

Leakage rule: queue load and free riders are legal because they are **current marketplace state**, not this order's future timestamps.

#### 2.6.3 Why XGBoost and not a neural net

```
           far away?
          /         \
       no             yes
       │               │
   peak hour?      queue busy?
    /     \          /     \
 quick  a bit     slow   grab a snack
        slow
```

- Tabular data, ~10 features, ~200K rows after cleaning. The signal is interactions (distance x peak x queue x zone), which trees split on natively.
- Deep nets beat GBDT on tabular data only with much more data or with sequences / router residuals. Uber moved to DeepETA at global scale with a routing-engine baseline. Swiggy's first last-mile model was gradient-boosted trees and they moved to nets only once live GPS pings arrived.
- XGBoost trains in seconds, ships as one file, gives feature importance, handles missing values natively.

#### 2.6.4 Loss and the asymmetry problem

We optimised **MAE** because ops can read minutes. But MAE treats "late by 15" and "early by 15" as the same mistake, and users do not.

```
  shown 30, arrived 45  -> anger, 1 star, refund risk, support load
  shown 45, arrived 30  -> mild annoyance or pleasant surprise
```

How the big players handle it: Uber DeepETA uses asymmetric Huber loss; DoorDash used quantile loss and asymmetric MSE, later probabilistic heads; Zomato used tree models with skew-aware (gamma / Tweedie-style) thinking. Our next step was a P75 to P80 quantile objective so the number shown is one we can beat.

#### 2.6.5 ETA metrics

| Metric | Why |
|---|---|
| MAE (minutes) | primary, the number ops understands |
| RMSE | punishes the 90-minute disasters that create tickets |
| % within ±5 min | what users perceive as "accurate" |
| % late by >15 min | the refund and 1-star tail |

**Baselines:** constant 45 minutes, and haversine km divided by average city speed. The model beat both on the forward split. We also plotted predicted vs actual by hour and by zone, because an MAE of 8 that is always 8 minutes optimistic is worse than an MAE of 9 that is centred.

---

### 2.7 Serving design

#### Feed: nightly batch + live filters
```
  NIGHTLY JOB                              ON REQUEST
  ───────────                              ──────────
  rebuild user + item features             read cached top-N for (user_id, city)
  (orders up to yesterday)                        │
          │                                       ▼
  LightFM scores each user                 live filters: open now, riders, radius
  against city vendors                            │
          │                                       ▼
  cache top-N (~80) per                    serve-time adjust (distance, meal slot)
  key: user_id + city                      + exploration slot
                                                  │
                                                  ▼
                                           10 to 20 cards
                                  (read + filter in tens of ms; model not on hot path)
```
Taste does not change hourly. Open/closed status and rider availability do, so those are serve-time filters.

#### ETA: live at checkout
```
  checkout ─► cheap features (distance, hour, size, vendor history)
           ─► live features (open orders NOW, free riders NOW)
           ─► XGBoost ─► clamp to [15, 90] min ─► show
```
Most of the latency budget is feature fetch, not the tree. Queue and rider counts must be current, or the model is a dressed-up historical average.

#### Retraining cadence
- **Feed:** weekly. Off-cycle trigger: new-vendor flood, or offline NDCG vs popularity collapsing on the rolling week.
- **ETA:** weekly to biweekly. Off-cycle trigger: rolling MAE above threshold for 3 days, monsoon onset, festival week. Festivals and monsoon move delivery time much more than they move taste.
- If metrics jump right after a logging change: do not retrain, fix the clock.

---

### 2.8 Foomato vs the giants (without pretending)

| Problem | Foomato | Large apps | Why we did not copy |
|---|---|---|---|
| Feed retrieval | rule filter to 40 to 60 vendors | Uber: two-tower + ANN, GraphSAGE graph embeddings | hundreds of vendors, not millions |
| Feed ranking | LightFM hybrid MF, 13 features | Uber: DLRM / DCNv2 + sequence models. Swiggy: GBDT -> pairwise/listwise DNN -> Wide & Deep | no real-time event stream, 200K rows |
| New restaurant | fixed exploration slot | Uber: multi-armed bandit | bandit needs online allocation infra |
| ETA structure | single-shot total minutes | Swiggy: O2A + FM + WT + LM; Uber: router baseline + residual | no clean per-leg labels or live pings |
| ETA model | XGBoost | Uber DeepETA, DoorDash MoE, Swiggy MIMO net | those win at their volume; on 10 columns they overfit |
| ETA loss | MAE | asymmetric Huber / quantile / Weibull | MAE kept it readable for ops |
| Serving | nightly feed cache, live ETA fetch | Uber: online query tower | right complexity for 20K MAU |

---

### 2.9 If I had another month

1. **Put predicted ETA into the feed score.** A perfect match 55 minutes away should lose to a good match 22 minutes away.
2. **Quantile ETA (P75 to P80) or asymmetric loss** so the checkout number is beatable.
3. **Decompose ETA** into at least prep vs transit once `accepted_at` and `picked_up_at` are trustworthy.
4. **Exploration accounting:** log forced new-vendor insertions so offline eval does not count them as ranker failures.
5. **Zone-level ETA calibration:** one model with a per-zone residual correction.

---

### 2.10 Interview Q&A bank

**Q: You said collaborative filtering and 13 features. Pure CF cannot take features. Which was it?**
LightFM, which is hybrid. The collaborative part is the interaction matrix of who ordered where; the features are user and item metadata whose embeddings get summed into the user and restaurant vectors. If you strip the features it collapses to plain MF.

**Q: How did LightFM know a restaurant was closed or far away?**
It did not. The serviceability filter removed closed and out-of-radius vendors before ranking, and live distance was applied as a serve-time adjustment. Zone features inside the model captured the static location preference.

**Q: Why WARP and not BPR?**
WARP optimises the top of the list directly by sampling negatives until it finds a violating one. The feed shows ~10 cards, so top-K precision is what matters.

**Q: How did you handle implicit feedback?**
Delivered orders as weighted positives (repeat and recency up-weighted via `sample_weight`), cancels as low-weight positives, and unseen items were never treated as hard negatives.

**Q: How did you split train/test?**
By time. Train May 2025 to Mar 2026, validate Apr 2026, test May to Jun 2026. Trailing features computed with a cutoff at the end of train.

**Q: What did you beat?**
Feed: popularity ranking on the same serviceable set and same time split. ETA: constant 45 minutes and distance divided by city-average speed. Both beat their baselines on the forward split.

**Q: Cold start?**
New user: geo + hour popularity until 3 delivered orders. New vendor: exploration slot scored on content features, which LightFM handles natively through feature embeddings.

**Q: Why not recommend dishes?**
The homepage renders restaurants. Dishes are a different inventory with hourly availability. Swiggy splits dish search from the restaurant feed too.

**Q: Where is the leakage risk in ETA?**
Anything known only after assignment or acceptance. Current queue load and free riders are legal because they are marketplace state at checkout.

**Q: Why treat cancelled orders differently in the two models?**
ETA needs a finished clock, so cancels are dropped. The feed can read a cancel as a weak "they considered this vendor." Same row, two labels.

**Q: Would you serve the ranker in real time?**
Not at 20K MAU. Nightly scores plus live availability filters is simpler and fast enough. Real-time inference pays off when clicks from the last few minutes should move the list, which needs an event bus we did not have.

**Q: How would you know the model is degrading?**
Feed: rolling conversion, ordered position, search fallback rate, vendor concentration. ETA: rolling MAE and % late by >15 min, split by zone and peak flag. Three days over threshold means retrain.

**Q: Why XGBoost for ETA but LightFM for the feed?**
Different problem shapes. ETA is tabular regression with strong feature interactions, which trees are built for. The feed is a user x item ranking problem where the strongest signal is the interaction matrix itself and cold start matters, which is what hybrid MF is built for.

---

### 2.11 Industry references used for the "at scale" comparisons

- Uber Eats: Food Discovery with Uber Eats (graph learning, recommending for the marketplace)
- Uber: Two Tower Embeddings at Uber; DeepETA
- Swiggy Bytes: Evolution of feed ranking at Swiggy; Learning to Rank Restaurants; Where is my order? (Parts I and II); Predicting Food Delivery Time at Cart
- DoorDash: ETA posts on quantile and asymmetric loss
- Zomato: DP-ETA
- LightFM paper: Kula, "Metadata Embeddings for User and Item Cold-start Recommendations" (2015)

None of these are Foomato internal documents; they are public write-ups used to place our system on the industry curve.
