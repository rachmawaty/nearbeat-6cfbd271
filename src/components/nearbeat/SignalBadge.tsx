import { SIGNAL_META, type DataSource, type SignalKey } from "@/data/nearbeat";
import { cn } from "@/lib/utils";

interface Props {
  signal: SignalKey;
  source?: DataSource;
  className?: string;
}

export function SignalBadge({ signal, source, className }: Props) {
  const meta = SIGNAL_META[signal];
  const sourceLabel = source ? (meta.sourceLabel as Record<string, string>)[source] : undefined;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase",
        className,
      )}
      style={{
        color: `hsl(var(--${meta.colorVar}))`,
        backgroundColor: `hsl(var(--${meta.colorVar}) / 0.12)`,
        boxShadow: `inset 0 0 0 1px hsl(var(--${meta.colorVar}) / 0.28)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `hsl(var(--${meta.colorVar}))` }}
      />
      {meta.label}
      {sourceLabel && (
        <span className="ml-1 text-[9px] font-medium opacity-70 normal-case tracking-normal">
          via {sourceLabel}
        </span>
      )}
    </span>
  );
}