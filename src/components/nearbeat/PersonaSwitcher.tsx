import { PERSONAS } from "@/data/nearbeat";
import { cn } from "@/lib/utils";

interface Props {
  active: string;
  onChange: (key: string) => void;
}

export function PersonaSwitcher({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 backdrop-blur-md">
      {PERSONAS.map((p) => {
        const isActive = p.key === active;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="mr-1">{p.avatar}</span>
            {p.name.split(" ")[0]}
          </button>
        );
      })}
    </div>
  );
}