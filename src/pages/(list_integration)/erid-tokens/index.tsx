import { useState } from "react";
import { X } from "lucide-react";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";
import advancedPlanEllipseLarge from "@/assets/erid-tokens/advanced-plan-ellipse-large.svg";
import advancedPlanEllipseSmall from "@/assets/erid-tokens/advanced-plan-ellipse-small.svg";

type TokenPackageId = "basic" | "advanced";

type TokenPackage = {
  id: TokenPackageId;
  title: string;
  price: string;
  tokens: string;
  rate: string;
  badge?: string;
};

const TOKEN_PACKAGES: Record<TokenPackageId, TokenPackage> = {
  basic: {
    id: "basic",
    title: "Базовый",
    price: "600,00 ₽",
    tokens: "60 токенов",
    rate: "10 рублей = 1 токен",
  },
  advanced: {
    id: "advanced",
    title: "Продвинутый",
    price: "4500,00 ₽",
    tokens: "500 токенов",
    rate: "7,5 рубль = 1 токен",
    badge: "Выгодно",
  },
};

// Макетные данные до появления API баланса и истории ERID-токенов.
const TOKEN_BALANCE_PLACEHOLDER = 24;
const TOKEN_OPERATIONS_PLACEHOLDER = [
  { id: "issue-1", title: "Выдача ERID-токена", date: "01.06.2024", amount: "-1 токен", positive: false },
  { id: "issue-2", title: "Выдача ERID-токена", date: "01.06.2024", amount: "-1 токен", positive: false },
  { id: "issue-3", title: "Выдача ERID-токена", date: "01.06.2024", amount: "-1 токен", positive: false },
  { id: "purchase-1", title: "Покупка пакета токенов", date: "01.06.2024", amount: "+500 токенов", positive: true },
] as const;

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-6 shrink-0 rounded p-0"
      onClick={onClick}
      aria-label="Закрыть"
    >
      <X className="size-6" strokeWidth={1.5} aria-hidden />
    </Button>
  );
}

function TokenPackageCard({
  plan,
  selected,
  onSelect,
}: {
  plan: TokenPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const advanced = plan.id === "advanced";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        "relative h-[108px] w-full overflow-hidden rounded-lg p-4 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40",
        advanced
          ? "bg-[#2563eb] text-white"
          : "border border-border bg-white text-foreground",
      ].join(" ")}
    >
      {advanced ? (
        <>
          <img
            src={advancedPlanEllipseLarge}
            alt=""
            className="pointer-events-none absolute left-[244px] top-[63px] max-w-none"
            aria-hidden
          />
          <img
            src={advancedPlanEllipseSmall}
            alt=""
            className="pointer-events-none absolute left-[219px] top-[-22px] max-w-none"
            aria-hidden
          />
        </>
      ) : null}

      <span className="relative flex h-5 items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1">
          <span className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
            {plan.title}
          </span>
          {plan.badge ? (
            <span className="rounded bg-[#26c464] px-1 text-[12px] font-medium leading-4 text-white">
              {plan.badge}
            </span>
          ) : null}
        </span>
        <span
          className={[
            "size-4 shrink-0 rounded-full",
            selected
              ? advanced
                ? "border-4 border-white bg-[#2563eb]"
                : "border-4 border-primary bg-white"
              : "border border-border bg-muted",
          ].join(" ")}
          aria-hidden
        />
      </span>

      <span className="relative mt-0 flex items-center">
        <span className="text-[20px] font-medium leading-8 tracking-[-0.34px]">
          {plan.price}
        </span>
        <span className="text-[13px] font-medium leading-4 tracking-[-0.0325px]">
          /{plan.tokens}
        </span>
      </span>
      <span
        className={[
          "relative mt-2 block text-[13px] font-medium leading-4 tracking-[-0.0325px]",
          advanced ? "text-white" : "text-muted-foreground",
        ].join(" ")}
      >
        {plan.rate}
      </span>
    </button>
  );
}

export default function EridTokensPage() {
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [paymentStubOpen, setPaymentStubOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] =
    useState<TokenPackageId>("advanced");
  const selectedPackage = TOKEN_PACKAGES[selectedPackageId];

  const openPaymentStub = () => {
    setPackagesOpen(false);
    setPaymentStubOpen(true);
  };

  return (
    <div className="-m-4 flex min-h-full flex-col bg-white md:-m-6">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
        <h1 className="text-[13px] font-medium leading-4 tracking-[-0.0325px]">
          ERID-токены
        </h1>
      </header>

      <main className="flex-1 px-4 py-10 lg:px-[120px]">
        <div className="mx-auto flex w-full max-w-[700px] flex-col gap-3">
          <section className="flex min-h-[136px] items-start gap-3 overflow-hidden rounded-lg border border-border p-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                Доступно токенов
              </p>
              <p className="text-[20px] font-medium leading-8 tracking-[-0.34px]">
                {TOKEN_BALANCE_PLACEHOLDER}
              </p>
              <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-muted-foreground">
                Токены необходимы для маркировки рекламы в соответствии со ст. 18.1 ФЗ «О рекламе». Для каждой рекламной публикации выдается один уникальный ERID-токен, который нужно разместить в публикации
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-7 shrink-0 rounded-md bg-[#26c464] px-2 text-[13px] font-medium leading-4 text-white shadow-none hover:bg-[#26c464]/90"
              onClick={() => setPackagesOpen(true)}
            >
              Пополнить
            </Button>
          </section>

          <section className="overflow-hidden rounded-lg border border-border">
            <div className="flex h-[52px] items-center border-b border-border px-4">
              <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
                История операций
              </h2>
            </div>
            <div>
              {TOKEN_OPERATIONS_PLACEHOLDER.map((operation) => (
                <div
                  key={operation.id}
                  className="grid min-h-12 grid-cols-3 items-center gap-2 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <p className="min-w-0 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                    {operation.title}
                  </p>
                  <p className="min-w-0 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-muted-foreground">
                    {operation.date}
                  </p>
                  <p
                    className={[
                      "min-w-0 text-right text-[13px] font-medium leading-4 tracking-[-0.0325px]",
                      operation.positive ? "text-[#26c464]" : "text-foreground",
                    ].join(" ")}
                  >
                    {operation.amount}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <DialogRoot open={packagesOpen} onOpenChange={setPackagesOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-6 h-[332px] w-[358px] max-w-[calc(100vw-32px)] translate-y-0 gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:top-[74px] sm:max-w-[358px]"
        >
          <DialogHeader className="h-11 flex-row items-center gap-4 space-y-0 px-4 py-2.5 text-left">
            <DialogTitle className="min-w-0 flex-1 text-[15px] font-medium leading-5 tracking-[-0.135px]">
              Пакет токенов
            </DialogTitle>
            <CloseButton onClick={() => setPackagesOpen(false)} />
          </DialogHeader>
          <div
            role="radiogroup"
            aria-label="Пакет токенов"
            className="flex h-[240px] flex-col gap-2 px-4 py-2"
          >
            {(Object.values(TOKEN_PACKAGES) as TokenPackage[]).map((plan) => (
              <TokenPackageCard
                key={plan.id}
                plan={plan}
                selected={selectedPackageId === plan.id}
                onSelect={() => setSelectedPackageId(plan.id)}
              />
            ))}
          </div>
          <DialogFooter className="h-12 flex-row items-center justify-end px-4 py-2.5 sm:justify-end">
            <Button
              type="button"
              size="sm"
              className="h-7 rounded-md bg-[#2563eb] px-2 text-[13px] font-medium leading-4 text-white shadow-none hover:bg-[#2563eb]"
              onClick={openPaymentStub}
            >
              Продолжить
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={paymentStubOpen} onOpenChange={setPaymentStubOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-6 w-[358px] max-w-[calc(100vw-32px)] translate-y-0 gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:top-[74px] sm:max-w-[358px]"
        >
          <DialogHeader className="h-11 flex-row items-center gap-4 space-y-0 px-4 py-2.5 text-left">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
                Оформление заказа
              </DialogTitle>
              <DialogDescription className="sr-only">
                Заглушка платёжного шага
              </DialogDescription>
            </div>
            <CloseButton onClick={() => setPaymentStubOpen(false)} />
          </DialogHeader>
          <div className="space-y-3 px-4 py-4 text-[13px] font-medium leading-4">
            <p>Оплата пока недоступна.</p>
            <p className="text-muted-foreground">
              Пакет «{selectedPackage.title}» на {selectedPackage.tokens} выбран. Здесь появится оформление заказа после подключения платёжного API.
            </p>
          </div>
          <DialogFooter className="h-12 flex-row items-center justify-end px-4 py-2.5 sm:justify-end">
            <Button
              type="button"
              size="sm"
              className="h-7 rounded-md px-2 text-[13px] font-medium leading-4 shadow-none"
              onClick={() => setPaymentStubOpen(false)}
            >
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
