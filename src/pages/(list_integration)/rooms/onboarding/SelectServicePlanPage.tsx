import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Target } from "lucide-react";
import { Badge, Button } from "@senler/ui";
import { ServicePlanCard } from "../components/ServicePlanCard";
import {
  DEFAULT_SERVICE_PLAN_ID,
  SERVICE_PLANS,
  isServicePlanId,
  type ServicePlanId,
} from "../types/servicePlan";

export default function SelectServicePlanPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialPlanId = useMemo(() => {
    const raw = searchParams.get("plan");
    return isServicePlanId(raw) ? raw : DEFAULT_SERVICE_PLAN_ID;
  }, [searchParams]);

  const [selectedPlanId, setSelectedPlanId] =
    useState<ServicePlanId>(initialPlanId);

  const handleContinue = () => {
    if (!slug) return;
    navigate(`/rooms/${slug}/onboarding/payment?plan=${selectedPlanId}`);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-xl flex-col items-center">
        <div
          className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"
          aria-hidden
        >
          <Target className="size-7" />
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Выберите пакет услуг
        </h1>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground sm:text-base">
          На баланс начислят коины, они
          <br />
          списываются при получении erid-токенов
        </p>

        <Badge
          variant="secondary"
          className="mt-4 border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
        >
          1 креатив = 5 erid-токенов
        </Badge>

        <div className="mt-8 flex w-[85%] max-w-full flex-col gap-3">
          <ServicePlanCard
            plan={SERVICE_PLANS.basic}
            selected={selectedPlanId === "basic"}
            onSelect={setSelectedPlanId}
          />
          <ServicePlanCard
            plan={SERVICE_PLANS.advanced}
            selected={selectedPlanId === "advanced"}
            onSelect={setSelectedPlanId}
          />
        </div>

        <div className="mt-8 flex w-[85%] max-w-full justify-end">
          <Button type="button" size="lg" onClick={handleContinue}>
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}
