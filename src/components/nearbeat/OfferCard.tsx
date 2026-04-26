import { useState } from "react";
import type { Offer } from "@/data/nearbeat";
import { SignalBadge } from "./SignalBadge";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  offer: Offer;
  onClaim: (o: Offer) => void;
  index: number;
}

export function OfferCard({ offer, onClaim, index }: Props) {
  const [claimed, setClaimed] = useState(false);
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:border-primary/40",
      )}
      style={{
        animationDelay: `${index * 80}ms`,
        backgroundImage: "var(--gradient-offer)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/60 text-2xl shrink-0">
          {offer.merchant_emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SignalBadge signal={offer.signal_used} source={offer.data_source} />
          </div>
          <h3 className="mt-2 font-display text-base font-semibold leading-tight">
            {offer.merchant_name}
          </h3>
          <p className="text-xs text-muted-foreground">{offer.category}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-sm font-bold text-offer">{offer.value}</div>
        </div>
      </div>

      <p className="mt-3 text-sm text-foreground/95 leading-snug">{offer.offer}</p>

      <div className="mt-3 rounded-lg bg-background/40 px-3 py-2 text-xs text-muted-foreground italic leading-snug">
        “{offer.reason}”
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {offer.eta_min === 0 ? "At destination" : `${offer.eta_min} min · ${offer.distance_m}m`}
        </span>
        <Button
          size="sm"
          variant={claimed ? "secondary" : "default"}
          onClick={() => {
            setClaimed(true);
            onClaim(offer);
          }}
          className="gap-1"
        >
          {claimed ? (
            <>
              <Check className="h-4 w-4" /> Saved to wallet
            </>
          ) : (
            <>
              Claim <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </article>
  );
}