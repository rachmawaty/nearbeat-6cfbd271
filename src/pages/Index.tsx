import { useCallback, useEffect, useMemo, useState } from "react";
import { PERSONAS, type Offer } from "@/data/nearbeat";
import { ContextBar } from "@/components/nearbeat/ContextBar";
import { IntegrationStatusBar } from "@/components/nearbeat/IntegrationStatusBar";
import { OfferCard } from "@/components/nearbeat/OfferCard";
import { LiveContextDrawer } from "@/components/nearbeat/LiveContextDrawer";
import { Onboarding } from "@/components/nearbeat/Onboarding";
import { Login } from "@/components/nearbeat/Login";
import { ThemeToggle } from "@/components/nearbeat/ThemeToggle";
import { AgentThinking } from "@/components/nearbeat/AgentThinking";
import { useAgent } from "@/hooks/useAgent";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { toast } from "@/hooks/use-toast";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [onboardedKeys, setOnboardedKeys] = useState<Set<string>>(new Set());
  const [time, setTime] = useState(() => formatTime(new Date()));

  const agent = useAgent();

  const persona = useMemo(
    () => PERSONAS.find((p) => p.key === activeKey) ?? PERSONAS[0],
    [activeKey],
  );

  // Active offers: AI-generated if available, else hardcoded persona offers
  const activeOffers: Offer[] = agent.result?.offers ?? persona.offers;

  const runAgent = useCallback(() => {
    agent.run(persona);
  }, [agent, persona]);

  // Heartbeat: re-run agent when context changes significantly
  const heartbeat = useHeartbeat(
    useCallback((reason: string) => {
      if (!activeKey) return;
      toast({ title: "Context updated", description: reason });
    }, [activeKey]),
    15 // stale after 15 minutes
  );

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  // Reset agent result when persona changes
  useEffect(() => {
    agent.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const handleClaim = (o: Offer) => {
    toast({ title: `${o.merchant_name} — claimed`, description: o.offer });
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
            onClick={() => setActiveKey(null)}
            className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            title="Switch account"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Switch user</span>
          </Button>
        </div>
      </header>

      <section
        key={persona.key}
        className="fade-up grid gap-5 lg:gap-8 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]"
      >
        {/* LEFT — context + agent panel */}
        <div className="space-y-4 lg:space-y-5 lg:sticky lg:top-5 lg:self-start">
          <ContextBar persona={persona} time={time} />

          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Live signals
              </span>
              <span className="hidden lg:inline text-[10px] text-muted-foreground">
                Heartbeat active
              </span>
            </div>
            <IntegrationStatusBar />
          </div>

          {/* Agent panel */}
          <AgentThinking
            steps={agent.steps}
            loading={agent.loading}
            reasoning={agent.result?.agent_reasoning}
            signals={agent.result?.signals_active}
            error={agent.error}
            onRun={runAgent}
            hasResult={!!agent.result}
            stale={heartbeat.stale}
            minutesSince={heartbeat.minutesSince}
          />
        </div>

        {/* RIGHT — offers */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {agent.result ? "AI-generated offers · just now" : "3 offers for you · just now"}
            </span>
            {agent.result && (
              <span className="text-[10px] text-muted-foreground">
                ✦ {agent.result._input_tokens + agent.result._output_tokens} tokens
              </span>
            )}
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {(agent.loading ? persona.offers : activeOffers).map((o, i) => (
              <div
                key={o.merchant_id}
                className={`fade-up ${agent.loading ? "opacity-40" : ""}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
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
