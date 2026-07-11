export type ServicePlanId = "basic" | "advanced";

export type ServicePlan = {
  id: ServicePlanId;
  title: string;
  price: string;
  tokensLabel: string;
  rate: string;
  badge?: string;
};

export const SERVICE_PLANS: Record<ServicePlanId, ServicePlan> = {
  basic: {
    id: "basic",
    title: "Базовый",
    price: "600,00 ₽",
    tokensLabel: "600 токенов",
    rate: "1 рубль = 1 erid-токен",
  },
  advanced: {
    id: "advanced",
    title: "Продвинутый",
    price: "4500,00 ₽",
    tokensLabel: "5 000",
    rate: "0,75 рубль = 1 erid-токен",
    badge: "Выгодно",
  },
};

export const DEFAULT_SERVICE_PLAN_ID: ServicePlanId = "advanced";

export function isServicePlanId(value: string | null): value is ServicePlanId {
  return value === "basic" || value === "advanced";
}

/** Заготовка для будущей оплаты на бэкенде. */
export type ServicePlanPaymentDraft = {
  planId: ServicePlanId;
  roomId: string;
};

export function buildServicePlanPaymentPayload(
  draft: ServicePlanPaymentDraft
): ServicePlanPaymentDraft {
  return draft;
}
