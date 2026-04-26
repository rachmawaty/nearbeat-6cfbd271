import { PERSONAS } from "@/data/nearbeat";
import { Sparkles, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  onPick: (key: string) => void;
}

export function Login({ onPick }: Props) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold">Nearbeat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your city pulse</p>
          <p className="mt-5 text-sm text-foreground/80 max-w-sm">
            Choose an account to sign in. Each one comes with their own live context bundle.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-2 backdrop-blur-md shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-3 pt-2 pb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sign in as
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 min-w-0">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                onClick={() => onPick(p.key)}
                className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <span>{p.avatar}</span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-display text-base font-semibold leading-tight truncate">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate shrink">
                      {p.occupation}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{p.subtitle}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">📍 {p.area}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Demo prototype · Mock accounts · No password required
        </p>
      </div>
    </div>
  );
}