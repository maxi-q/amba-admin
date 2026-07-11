import type { ServicePlanId } from "../types/servicePlan";
import { buildServicePlanPaymentPayload } from "../types/servicePlan";

export type PaymentMethodId = "yookassa_sbp";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { id: "yookassa_sbp", label: "ЮKassa (СПБ)" },
];

export type ServicePlanCheckoutInput = {
  roomId: string;
  planId: ServicePlanId;
  email: string;
  paymentMethodId: PaymentMethodId;
  orderNumber: string;
};

export type ServicePlanOrderResult = {
  orderId: string;
  paymentUrl: string | null;
};

/** Номер заказа для UI до появления API. */
export function createStubOrderNumber(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Создаёт заказ на бэкенде (заготовка).
 * TODO: POST /api/rooms/:roomId/service-plan/orders
 */
export async function createServicePlanOrder(
  input: ServicePlanCheckoutInput
): Promise<ServicePlanOrderResult> {
  buildServicePlanPaymentPayload({
    planId: input.planId,
    roomId: input.roomId,
  });

  return {
    orderId: input.orderNumber,
    paymentUrl: null,
  };
}

/**
 * Инициирует оплату через платёжный шлюз (заготовка).
 * TODO: вернуть paymentUrl от ЮKassa и редиректить пользователя.
 */
export async function initiateServicePlanPayment(
  input: ServicePlanCheckoutInput
): Promise<ServicePlanOrderResult> {
  const order = await createServicePlanOrder(input);

  if (order.paymentUrl) {
    window.location.assign(order.paymentUrl);
  }

  return order;
}

/**
 * Проверяет статус оплаты (заготовка).
 * TODO: GET /api/orders/:orderId/status или webhook.
 */
export async function verifyServicePlanPayment(
  orderId: string
): Promise<"pending" | "paid" | "failed"> {
  void orderId;
  return "paid";
}
