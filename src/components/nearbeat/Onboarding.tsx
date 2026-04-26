import { useState } from "react";
import { Button } from "@/components/ui/button";
import { INTEGRATIONS } from "@/data/nearbeat";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  onDone: () => void;
}

export function Onboarding({ onDone }: Props) {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (key: string) => {
    setConnecting(key);
    setTimeout(() => {
      setConnected((c) => ({ ...c, [key]: true }));
      setConnecting(null);
    }, 700);
  };

  const allConnected = INTEGRATIONS.every((i) => connected[i.key]);
  const count = INTEGRATIONS.filter((i) => connected[i.key]).length;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold">Nearbeat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your city pulse</p>
          <p className="mt-4 text-sm text-foreground/80 max-w-sm">
            Connect your live signals so the city knows you — not a simulation of you.
            Every offer cites the exact signal that triggered it.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-md shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 1 · Connect integrations
            </span>
            <span className="text-xs text-muted-foreground">{count}/{INTEGRATIONS.length}</span>
          </div>

          <div className="grid gap-2">
            {INTEGRATIONS.map((i) => {
              const isOn = connected[i.key];
              const isLoading = connecting === i.key;
              return (
                <button
                  key={i.key}
                  disabled={isOn || isLoading}
                  onClick={() => handleConnect(i.key)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border bg-background/40 px-3 py-3 text-left transition-all",
                    isOn ? "border-offer/40 bg-offer/10" : "border-border/60 hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: `hsl(var(--${i.colorVar}))` }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{i.label}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{i.source}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium shrink-0">
                    {isOn ? (
                      <span className="inline-flex items-center gap-1 text-offer">
                        <Check className="h-3.5 w-3.5" /> Connected
                      </span>
                    ) : isLoading ? (
                      <span className="text-muted-foreground">Connecting…</span>
                    ) : (
                      <span className="text-primary">Connect</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={onDone}
          className="mt-5 h-12 w-full text-base"
          style={{ background: "var(--gradient-brand)" }}
        >
          {count === 0
            ? "Skip for now → Open my wallet"
            : count === INTEGRATIONS.length
              ? "Open my wallet →"
              : `Continue with ${count} signal${count === 1 ? "" : "s"} →`}
        </Button>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Connect only what you want — offers will use whatever signals you share.
        </p>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Demo prototype · No real OAuth · Mock data only
        </p>
      </div>
    </div>
  );
}