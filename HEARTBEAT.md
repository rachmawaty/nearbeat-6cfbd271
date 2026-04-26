# Nearbeat Heartbeat

The heartbeat is the mechanism that keeps Nearbeat's context fresh and offers relevant.
It monitors signal changes every 30 seconds and triggers a new agent run when the
context shifts meaningfully.

---

## Heartbeat Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Client                          │
│                                                         │
│  useHeartbeat() ──── tick every 30s ────────────────┐  │
│                                                      │  │
│  ┌─────────────────────────────────────────────────┐ │  │
│  │  Context Snapshot (last known state)            │ │  │
│  │  ├── time_of_day_label: "morning_commute"       │ │  │
│  │  ├── weather_code: "sunny"                      │ │  │
│  │  └── last_run: 2026-04-26T08:05:00Z             │ │  │
│  └─────────────────────────────────────────────────┘ │  │
│                         │                             │  │
│                    diff against current               │  │
│                         │                             │  │
│                  change detected? ◄───────────────────┘  │
│                         │                                 │
│                   Yes ──┼── No (sleep 30s)               │
│                         │                                 │
│               onContextChanged(reason)                   │
│                         │                                 │
│               useAgent.run(persona)                      │
│                         │                                 │
│               POST /api/pulse  ───► Agent Server         │
│                         │               │                 │
│               new offers ◄─────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## Trigger Conditions

| Trigger | Condition | Priority |
|---------|-----------|----------|
| **Time label change** | `morning_commute` → `lunch` → `afternoon` → `evening` | High |
| **Offers stale** | > 15 minutes since last pulse | Medium |
| **Manual refresh** | User clicks "Re-run" | Immediate |
| **Persona switch** | User switches to a different persona | Immediate |
| *(Production)* Location change | User enters new neighborhood | High |
| *(Production)* Weather change | Precipitation starts/stops, temp ±10°F | Medium |
| *(Production)* Calendar event | 30 min before a scheduled event | High |
| *(Production)* Gym check-in | HealthKit detects gym activity | High |

---

## Time-of-Day Labels

The heartbeat maps wall-clock time to a semantic label that shapes the agent's offer strategy:

| Label | Window | Agent Behavior |
|-------|--------|----------------|
| `morning_commute` | 7:00 – 9:30am | Route-heavy · coffee · grab-and-go |
| `morning` | 9:30 – 11:30am | Discovery mode · errands · wellness |
| `lunch` | 11:30am – 2:00pm | Schedule + spend · dining focus |
| `afternoon` | 2:00 – 5:00pm | Habit + spend · quick errands |
| `evening` | 5:00 – 8:00pm | Post-work · gym · dining |
| `night` | 8:00pm – midnight | Delivery · entertainment · late study |

When the label transitions, the heartbeat fires immediately and the agent re-generates
offers tuned to the new time context.

---

## Signal TTL (Time to Live)

| Signal | TTL | Source |
|--------|-----|--------|
| Weather | 30 min | OpenWeather |
| Location | 5 min | Google Maps |
| Schedule | 1 hour | Google Calendar |
| Spend habits | 24 hours | Plaid |
| Email bookings | 1 hour | Gmail |
| Health activity | 15 min | HealthKit |
| Offers (page) | 15 min | Agent |

When any signal expires and the user has the app open, the heartbeat marks offers as
stale and surfaces a "Refresh" prompt in the AgentThinking panel.

---

## Heartbeat State Machine

```
         ┌──────────┐
  start  │  FRESH   │  agent just ran
  ──────►│ (0-5 min)│
         └────┬─────┘
              │ 5 min
              ▼
         ┌──────────┐
         │  AGING   │  offers still valid
         │(5-15 min)│
         └────┬─────┘
              │ 15 min  OR  context changed
              ▼
         ┌──────────┐
         │  STALE   │  "Refresh" button highlighted
         │  (>15m)  │
         └────┬─────┘
              │ user clicks OR auto-trigger
              ▼
         ┌──────────┐
         │ RUNNING  │  agent loop in progress
         │          │
         └────┬─────┘
              │ done
              ▼
         ┌──────────┐
         │  FRESH   │  ← back to start
         └──────────┘
```

---

## Production Heartbeat (Server-Side)

In production, the heartbeat runs as a server-side process per active session:

1. **WebSocket** connection between client and agent server
2. Server polls signal sources on each user's TTL schedule
3. When a signal changes, server pushes `{ event: "context_changed", reason, delta }` to client
4. Client calls `/api/pulse` with updated context
5. New offers streamed back via SSE (Server-Sent Events)

This eliminates the need for client-side polling and enables truly push-based,
real-time context updates.

---

## Implementation

```typescript
// useHeartbeat.ts — simplified
useEffect(() => {
  const tick = () => {
    const currentLabel = getTimeLabel();          // wall clock → label
    const mins = (Date.now() - lastRun) / 60_000;

    if (currentLabel !== lastLabel) {
      onContextChanged(`Time of day → ${currentLabel}`);
    } else if (mins >= STALE_AFTER_MINUTES) {
      onContextChanged(`Offers stale (${Math.round(mins)}m)`);
    }
  };
  const id = setInterval(tick, 30_000);          // check every 30s
  return () => clearInterval(id);
}, [lastRun, lastLabel]);
```

---

## Design Principles

1. **Lazy by default** — the heartbeat notifies, the user confirms. No silent re-fetches.
2. **Context-aware** — triggers are semantic (label change) not just time-based.
3. **Privacy-first** — signal polling happens on the server with user-consented tokens only.
4. **Graceful degradation** — if the agent is unavailable, the client falls back to hardcoded persona offers.
