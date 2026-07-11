import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  InputField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import {
  DEFAULT_SERVICE_PLAN_ID,
  SERVICE_PLANS,
  isServicePlanId,
} from "../types/servicePlan";
import {
  PAYMENT_METHODS,
  createStubOrderNumber,
  initiateServicePlanPayment,
  type PaymentMethodId,
} from "../utils/servicePlanPayment";

export default function ServicePlanPaymentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planId = useMemo(() => {
    const raw = searchParams.get("plan");
    return isServicePlanId(raw) ? raw : DEFAULT_SERVICE_PLAN_ID;
  }, [searchParams]);

  const plan = SERVICE_PLANS[planId];
  const orderNumber = useMemo(() => createStubOrderNumber(), []);

  const [email, setEmail] = useState("");
  const [paymentMethodId, setPaymentMethodId] =
    useState<PaymentMethodId>("yookassa_sbp");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const canPay = Boolean(email.trim()) && termsAccepted && !isPaying;

  const handleBack = () => {
    if (!slug) return;
    navigate(`/rooms/${slug}/onboarding/tariff?plan=${planId}`);
  };

  const handlePay = async () => {
    if (!slug || !canPay) return;

    setIsPaying(true);
    try {
      await initiateServicePlanPayment({
        roomId: slug,
        planId,
        email: email.trim(),
        paymentMethodId,
        orderNumber,
      });
      navigate(`/rooms/${slug}/setting`, { replace: true });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-lg flex-col">
        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Заказ № {orderNumber}
        </h1>

        <Card className="mt-8 w-full">
          <CardContent className="space-y-5 p-4 sm:p-6">
            <InputField
              label="E-mail для чека *"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder=""
              autoComplete="email"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Способ оплаты</p>
              <Select
                value={paymentMethodId}
                onValueChange={(value) =>
                  setPaymentMethodId(value as PaymentMethodId)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-dashed border-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Тариф</span>
                <span className="font-medium text-foreground">{plan.title}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-foreground">К оплате</span>
                <span className="text-base font-semibold text-foreground">
                  {plan.price}
                </span>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
                aria-label="Принять условия соглашения и оферты"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                Я ознакомлен и принимаю условия{" "}
                <a
                  href="#"
                  className="text-primary underline underline-offset-2 hover:text-primary/90"
                  onClick={(event) => event.preventDefault()}
                >
                  Пользовательского соглашения
                </a>{" "}
                и{" "}
                <a
                  href="#"
                  className="text-primary underline underline-offset-2 hover:text-primary/90"
                  onClick={(event) => event.preventDefault()}
                >
                  Оферты
                </a>
              </span>
            </label>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={isPaying}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Назад
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!canPay}
            onClick={handlePay}
            className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-500/50"
          >
            {isPaying ? "Оплата…" : "Оплатить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
