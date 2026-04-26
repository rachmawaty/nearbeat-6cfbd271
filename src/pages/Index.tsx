import { useEffect, useMemo, useState } from "react";
import { PERSONAS, type Offer } from "@/data/nearbeat";
import { ContextBar } from "@/components/nearbeat/ContextBar";
import { IntegrationStatusBar } from "@/components/nearbeat/IntegrationStatusBar";
import { OfferCard } from "@/components/nearbeat/OfferCard";
import { LiveContextDrawer } from "@/components/nearbeat/LiveContextDrawer";
import { Onboarding } from "@/components/nearbeat/Onboarding";
import { Login } from "@/components/nearbeat/Login";
import { ThemeToggle } from "@/components/nearbeat/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [onboardedKeys, setOnboardedKeys] = useState<Set<string>>(new Set());
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  const persona = useMemo(
    () => PERSONAS.find((p) => p.key === activeKey) ?? PERSONAS[0],
    [activeKey],
  );

  const handleClaim = (o: Offer) => {
    toast({
      title: `${o.merchant_name} — claimed`,
      description: o.offer,
    });
  };

  const handleSignOut = () => {
    setActiveKey(null);
  };

  if (!activeKey) return <Login onPick={(k) => setActiveKey(k)} />;

  if (!onboardedKeys.has(activeKey)) {
    return (
      <Onboarding
        onDone={() =>
          setOnboardedKeys((prev) => {
            const next = new Set(prev);
            next.add(activeKey);
            return next;
          })
        }
      />
    );
  }

  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-10 py-5 mx-auto max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg lg:text-xl font-bold leading-none">Nearbeat</h1>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Your city pulse</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LiveContextDrawer persona={persona} />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            title="Switch account"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Switch user</span>
          </Button>
        </div>
      </header>

      {/* Mobile-first single column; desktop becomes 2-column wallet */}
      <section
        key={persona.key}
        className="fade-up grid gap-5 lg:gap-8 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]"
      >
        {/* LEFT — context column */}
        <div className="space-y-4 lg:space-y-5 lg:sticky lg:top-5 lg:self-start">
          <ContextBar persona={persona} time={time} />

          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Live signals
              </span>
              <span className="hidden lg:inline text-[10px] text-muted-foreground">
                Auto-refreshing
              </span>
            </div>
            <IntegrationStatusBar />
          </div>

          <div className="hidden lg:block rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-md shadow-[var(--shadow-card)]">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nearbeat reasons over your live context — bank, calendar, route, weather,
              health, email — to surface 3 offers tailored to{" "}
              <span className="text-foreground font-medium">right now</span>. Every offer
              cites the exact signal that triggered it.
            </p>
          </div>
        </div>

        {/* RIGHT — offers */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3 offers for you · just now
            </span>
            <span className="text-[10px] lg:text-xs text-muted-foreground">via Claude</span>
          </div>
          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {persona.offers.map((o, i) => (
              <div key={o.merchant_id} className="fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <OfferCard offer={o} onClaim={handleClaim} index={i} />
              </div>
            ))}
          </div>

          <footer className="pt-8 pb-8 text-center">
            <p className="text-[10px] lg:text-xs text-muted-foreground">
              Prototype · MIT AI Hackathon 2026 · Generative City Wallet
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
};

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default Index;
