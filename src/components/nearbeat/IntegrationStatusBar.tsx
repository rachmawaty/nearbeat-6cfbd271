import { INTEGRATIONS } from "@/data/nearbeat";

export function IntegrationStatusBar() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {INTEGRATIONS.map((it) => (
        <div
          key={it.key}
          className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 backdrop-blur-sm shrink-0"
          title={`${it.label} · ${it.source} · live`}
        >
          <span
            className="pulse-dot h-1.5 w-1.5 rounded-full"
            style={{ color: `hsl(var(--${it.colorVar}))`, backgroundColor: `hsl(var(--${it.colorVar}))` }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}