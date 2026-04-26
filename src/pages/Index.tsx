import { useEffect, useMemo, useState } from "react";
import { PERSONAS, type Offer } from "@/data/nearbeat";
import { ContextBar } from "@/components/nearbeat/ContextBar";
import { IntegrationStatusBar } from "@/components/nearbeat/IntegrationStatusBar";
import { OfferCard } from "@/components/nearbeat/OfferCard";
import { LiveContextDrawer } from "@/components/nearbeat/LiveContextDrawer";
import { Onboarding } from "@/components/nearbeat/Onboarding";
import { Login } from "@/components/nearbeat/Login";
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
    <main className="min-h-screen w-full px-4 py-5 mx-auto max-w-md">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-none">Nearbeat</h1>
            <p className="text-[10px] text-muted-foreground">Your city pulse</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiveContextDrawer persona={persona} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            title="Switch account"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <section key={persona.key} className="space-y-4 fade-up">
        <ContextBar persona={persona} time={time} />

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Live signals
            </span>
          </div>
          <IntegrationStatusBar />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              3 offers for you · just now
            </span>
            <span className="text-[10px] text-muted-foreground">via Claude</span>
          </div>
          <div className="space-y-3">
            {persona.offers.map((o, i) => (
              <div key={o.merchant_id} className="fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <OfferCard offer={o} onClaim={handleClaim} index={i} />
              </div>
            ))}
          </div>
        </div>

        <footer className="pt-4 pb-8 text-center">
          <p className="text-[10px] text-muted-foreground">
            Prototype · MIT AI Hackathon 2026 · Generative City Wallet
          </p>
        </footer>
      </section>
    </main>
  );
};

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default Index;
