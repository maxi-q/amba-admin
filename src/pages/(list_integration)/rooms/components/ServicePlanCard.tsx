import { Badge } from "@senler/ui";
import type { ServicePlan, ServicePlanId } from "../types/servicePlan";

interface ServicePlanCardProps {
  plan: ServicePlan;
  selected: boolean;
  onSelect: (planId: ServicePlanId) => void;
}

function PlanRadioIndicator({ selected, variant }: { selected: boolean; variant: "light" | "dark" }) {
  if (variant === "dark") {
    return selected ? (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-transparent">
        <span className="size-2.5 rounded-full bg-white" />
      </span>
    ) : (
      <span className="size-5 shrink-0 rounded-full border-2 border-white/70 bg-transparent" />
    );
  }

  return selected ? (
    <span className="flex size-5 items-center justify-center rounded-full border-2 border-primary bg-background">
      <span className="size-2.5 rounded-full bg-primary" />
    </span>
  ) : (
    <span className="size-5 rounded-full border-2 border-muted-foreground/40" />
  );
}

export function ServicePlanCard({ plan, selected, onSelect }: ServicePlanCardProps) {
  const isAdvanced = plan.id === "advanced";

  if (isAdvanced) {
    return (
      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-shadow sm:p-5 ${
          selected
            ? "border-primary bg-primary text-primary-foreground shadow-md"
            : "border-primary/30 bg-primary text-primary-foreground"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
          aria-hidden
        >
          <span className="absolute -right-3 -top-9 size-[4.75rem] rounded-full bg-white/25 sm:size-[5.5rem]" />
          <span className="absolute -bottom-16 -right-10 size-[8.5rem] rounded-full bg-white/20 sm:size-[9.5rem]" />
        </div>

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold sm:text-lg">{plan.title}</span>
            {plan.badge ? (
              <Badge className="border-0 bg-emerald-500 text-white hover:bg-emerald-500">
                {plan.badge}
              </Badge>
            ) : null}
          </div>
          <PlanRadioIndicator selected={selected} variant="dark" />
        </div>

        <p className="relative mt-4 text-xl font-bold tracking-tight sm:mt-5 sm:text-2xl">
          {plan.price}
          <span className="ml-1.5 align-super text-sm font-medium opacity-80 sm:text-base">
            {plan.tokensLabel}
          </span>
        </p>
        <p className="relative mt-2 text-xs opacity-90 sm:text-sm">{plan.rate}</p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      className={`w-full rounded-xl border bg-card p-4 text-left transition-colors sm:p-5 ${
        selected ? "border-primary shadow-sm" : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-base font-semibold text-foreground sm:text-lg">{plan.title}</span>
        <PlanRadioIndicator selected={selected} variant="light" />
      </div>

      <p className="mt-4 text-xl font-bold tracking-tight text-foreground sm:mt-5 sm:text-2xl">
        {plan.price}
        <span className="text-lg font-bold sm:text-xl"> / {plan.tokensLabel}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{plan.rate}</p>
    </button>
  );
}
