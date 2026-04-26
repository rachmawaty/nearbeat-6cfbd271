import { useState, useEffect, useRef, useCallback } from "react";

export type TimeLabel =
  | "morning_commute"
  | "morning"
  | "lunch"
  | "afternoon"
  | "evening"
  | "night";

export interface HeartbeatState {
  label: TimeLabel;
  lastRun: number;
  minutesSince: number;
  stale: boolean; // true when > 15 min since last agent run
}

function getTimeLabel(): TimeLabel {
  const h = new Date().getHours();
  if (h >= 7 && h < 9.5)  return "morning_commute";
  if (h >= 9.5 && h < 11.5) return "morning";
  if (h >= 11.5 && h < 14) return "lunch";
  if (h >= 14 && h < 17)  return "afternoon";
  if (h >= 17 && h < 20)  return "evening";
  return "night";
}

/**
 * useHeartbeat
 * Monitors context signals every 30 seconds.
 * Fires onContextChanged when:
 *   - The time-of-day label changes (e.g. morning → lunch)
 *   - More than STALE_AFTER_MINUTES have passed since last agent run
 */
export function useHeartbeat(
  onContextChanged: (reason: string) => void,
  STALE_AFTER_MINUTES = 15
): HeartbeatState & { markRun: () => void } {
  const [lastRun, setLastRun] = useState(Date.now());
  const [minutesSince, setMinutesSince] = useState(0);
  const labelRef = useRef<TimeLabel>(getTimeLabel());
  const [label, setLabel] = useState<TimeLabel>(getTimeLabel());

  const markRun = useCallback(() => {
    setLastRun(Date.now());
    setMinutesSince(0);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const mins = (now - lastRun) / 60_000;
      setMinutesSince(mins);

      const currentLabel = getTimeLabel();

      // Trigger: time-of-day changed
      if (currentLabel !== labelRef.current) {
        labelRef.current = currentLabel;
        setLabel(currentLabel);
        onContextChanged(`Time of day changed to ${currentLabel}`);
        return;
      }

      // Trigger: offers are stale
      if (mins >= STALE_AFTER_MINUTES) {
        onContextChanged(`${Math.round(mins)} minutes since last pulse`);
      }
    };

    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [lastRun, STALE_AFTER_MINUTES, onContextChanged]);

  return { label, lastRun, minutesSince, stale: minutesSince >= STALE_AFTER_MINUTES, markRun };
}
