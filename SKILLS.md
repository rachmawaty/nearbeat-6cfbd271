# Nearbeat Agent — Skills

Nearbeat is a personalized AI city-wallet agent powered by Claude (claude-sonnet-4-6).
It reasons over a user's real-world signals and generates exactly 3 hyper-relevant,
time-sensitive offers from nearby merchants — citing the exact signal that triggered each one.

---

## Signal Skills

| Signal | Source | What Nearbeat reads |
|--------|--------|---------------------|
| `route` | Google Maps | Live commute path, upcoming waypoints, ETA to merchants on route |
| `schedule` | Google Calendar | Upcoming events, pre-meeting windows, post-event needs |
| `habit` | Plaid | Recurring merchants, visit frequency, category preferences |
| `spend` | Plaid | Top spend categories, avg transaction, wallet tier |
| `weather` | OpenWeather | Live conditions, precipitation forecast, feels-like temp |
| `health` | HealthKit / Google Fit | Gym check-ins, step count, activity level, recovery state |
| `email` | Gmail | Purchase receipts, restaurant bookings, loyalty emails |

---

## Tool Capabilities

### `get_merchants_nearby(city, categories?)`
Returns a filtered list of real merchants near the user's current city,
ordered by distance. Categories filter by type (coffee, dining, wellness, retail, etc.).

**In production:** Calls Google Places API with real lat/lng + radius.

---

### `get_live_weather(city)`
Returns current weather conditions including condition label, temperature,
emoji, weather code, and a plain-English advisory.

**In production:** Calls OpenWeather API with real coordinates.

---

### `score_signal_relevance(signal, context)`
Given a signal type and the full user context, returns a relevance score (0.0–1.0)
and a human-readable reason explaining why the signal is (or isn't) active right now.

Used by the agent to decide which signals to lead with in each offer.

---

## Reasoning Skills

### Context Fusion
The agent receives the full `Persona` context bundle — location, schedule, spending history,
health state, email bookings, and weather — and fuses them into a unified understanding
of what the user needs *right now*.

### Signal Scoring
Before generating offers, the agent calls `score_signal_relevance` for the most promising
signals. Only the top-scoring signals are cited in the final offers.

### Offer Generation
Each offer is grounded in:
1. **A real nearby merchant** (fetched via `get_merchants_nearby`)
2. **A specific, scored signal** (e.g. "gym class at 18:00" → post-workout smoothie)
3. **A time-sensitive hook** (the reason this offer is relevant *today*, not tomorrow)

No two offers may share the same `signal_used` — the agent is required to diversify.

### Timing Optimizer
The agent considers *when* the user will encounter each merchant and surfaces offers
at the highest-intent moment:

| Moment | Trigger |
|--------|---------|
| Pre-commute | 15 min before habitual departure |
| En route | User enters merchant's neighborhood |
| Pre-meal | 45 min before typical lunch/dinner time |
| Post-gym | Within 30 min of a detected gym check-in |
| Pre-event | 30 min before a calendar event near the merchant |

---

## Actions

| Action | Description |
|--------|-------------|
| `pulse(persona)` | Run full agentic loop: fetch context → score signals → generate 3 offers |
| `claim(offer)` | Mark an offer claimed; in production, notifies the merchant POS |
| `regenerate()` | Force a new agent run with current context (no cache) |
| `heartbeat()` | Check if context has changed since last pulse; re-run if stale |

---

## Agentic Loop

```
User context (JSON)
      │
      ▼
┌─────────────────────────────────┐
│  Claude claude-sonnet-4-6 (system prompt)  │
│                                 │
│  1. get_merchants_nearby()      │ ← tool call 1
│  2. get_live_weather()          │ ← tool call 2
│  3. score_signal_relevance() ×3 │ ← tool calls 3-5
│  4. Reason over results         │
│  5. Generate 3 offers (JSON)    │ ← final response
└─────────────────────────────────┘
      │
      ▼
{ agent_reasoning, signals_active, offers[] }
```

The loop runs until `stop_reason === "end_turn"` (no more tool calls needed).
Average: 4–6 tool calls, ~2s latency, ~800–1200 tokens.

---

## Privacy Model

- All signal reading requires explicit user consent (granted in the Connect flow)
- Data is processed in-memory only — no raw signals are persisted
- Users can revoke any integration at any time
- The agent sees only the context bundle, never raw email/bank content
