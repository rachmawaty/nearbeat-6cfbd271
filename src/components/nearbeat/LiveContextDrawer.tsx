import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import type { Persona } from "@/data/nearbeat";

export function LiveContextDrawer({ persona }: { persona: Persona }) {
  const sections: { title: string; source: string; colorVar: string; items: string[] }[] = [
    {
      title: "Schedule",
      source: "Google Calendar · synced 2m ago",
      colorVar: "signal-schedule",
      items: persona.schedule.map((s) => `${s.time} — ${s.event}${s.location ? ` · ${s.location}` : ""}`),
    },
    {
      title: "Spend",
      source: "Plaid · synced 14m ago",
      colorVar: "signal-spend",
      items: [
        `Top categories: ${persona.spend.categories.join(", ")}`,
        `Recent merchants: ${persona.spend.merchants.join(", ")}`,
      ],
    },
    {
      title: "Email",
      source: "Gmail · synced 6m ago",
      colorVar: "signal-email",
      items: persona.email_bookings.length
        ? persona.email_bookings.map((b) => `${b.merchant} — ${b.time}`)
        : ["No recent bookings"],
    },
    {
      title: "Health",
      source: "HealthKit · synced just now",
      colorVar: "signal-health",
      items: [
        `Activity level: ${persona.health.activity}`,
        persona.health.gym_today ? "Gym session today ✓" : "Rest day",
      ],
    },
    {
      title: "Weather",
      source: "OpenWeather · 30s ago",
      colorVar: "signal-weather",
      items: [`${persona.weather.temp}° · ${persona.weather.label}`],
    },
    {
      title: "Route",
      source: "Google Maps · live",
      colorVar: "signal-route",
      items: [`Next waypoint: ${persona.next_waypoint.name} in ${persona.next_waypoint.eta} min`],
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full">
          <Activity className="h-4 w-4" />
          Live signals
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl border-border/60 bg-card max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Live context bundle</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Raw signals Claude reasons over to generate your offers.
          </p>
        </SheetHeader>
        <div className="mt-4 grid gap-3">
          {sections.map((s) => (
            <div key={s.title} className="rounded-xl border border-border/60 bg-background/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `hsl(var(--${s.colorVar}))` }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider">{s.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{s.source}</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-foreground/85">
                {s.items.map((it, i) => (
                  <li key={i} className="leading-snug">• {it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}