import { useState } from "react";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Input,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { Gift } from "lucide-react";
import { toast } from "sonner";
import type { GetMyEventsResponseItemDto } from "@/api/generated/model";
import type { CompetitionScope } from "@/hooks/competitions/types";
import { useEventPromoRewardActions } from "@/hooks/events/useEventPromoRewardActions";
import { useEventPromoRewardRules } from "@/hooks/events/useEventPromoRewards";
import { usePromoPointsRules } from "@/hooks/promoCodes/usePromoPoints";
import { usePromoPointsActions } from "@/hooks/promoCodes/usePromoPointsActions";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import pencil from "@/assets/task-flow/pencil.svg";
import plus from "@/assets/task-flow/plus.svg";
import star from "@/assets/task-flow/star.svg";

type Props = {
  event: GetMyEventsResponseItemDto;
  scope: CompetitionScope;
  onDirtyChange?: (dirty: boolean) => void;
};

function PromoCardShell({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
      <header className="flex items-start justify-between gap-4 p-4">
        <div>
          <h2 className="text-[15px] leading-5">Промокод</h2>
          <p className="mt-1 max-w-[430px] text-[#797979]">{description}</p>
        </div>
        {children}
      </header>
    </section>
  );
}

function RuleSummary({
  prefix,
  reward,
  usages,
  onEdit,
}: {
  prefix: string;
  reward: React.ReactNode;
  usages: number;
  onEdit: () => void;
}) {
  return (
    <div className="border-t border-[#e4e4e4] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-[180px] truncate rounded-full bg-[#f0f0f0] px-2 py-1">
            {prefix}
          </span>
          <span className="text-[#797979]">Начислять</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2 py-1">
            {reward}
          </span>
          <span className="whitespace-nowrap text-[#797979]">
            каждые {usages} {usages === 1 ? "активацию" : "активаций"}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 gap-1 border-[#e4e4e4] px-2 shadow-none"
          onClick={onEdit}
        >
          <img src={pencil} alt="" className="size-4" />
          Редактировать
        </Button>
      </div>
    </div>
  );
}

function ContestPromoSetup({ event, scope, onDirtyChange }: Props) {
  const rules = usePromoPointsRules(scope);
  const actions = usePromoPointsActions(scope);
  const current = rules.data?.find((rule) => rule.isActive);
  const [open, setOpenState] = useState(false);
  const [points, setPoints] = useState("");
  const [usages, setUsages] = useState("");
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onDirtyChange?.(next);
    if (next) {
      setPoints(current?.pointsPerAward ?? "");
      setUsages(String(current?.usagesPerAward ?? ""));
    }
  };
  const valid =
    /^[1-9]\d*$/.test(points) &&
    BigInt(points || "0") <= 9223372036854775807n &&
    /^[1-9]\d*$/.test(usages) &&
    Number(usages) <= 2147483647;

  return (
    <>
      <PromoCardShell description="Создайте промокод, за который участники смогут получить дополнительные XP">
        {!current && !rules.isLoading ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-7 border-[#e4e4e4] shadow-none"
            aria-label="Добавить промокод"
            onClick={() => setOpen(true)}
          >
            <img src={plus} alt="" />
          </Button>
        ) : null}
      </PromoCardShell>
      {rules.isLoading ? (
        <div className="-mt-px rounded-b-lg border border-[#e4e4e4] p-3"><PageLoader label="Загрузка промокода…" /></div>
      ) : current ? (
        <div className="-mt-px overflow-hidden rounded-b-lg border border-[#e4e4e4] bg-white">
          <RuleSummary
            prefix={event.promoCodesPrefix}
            reward={<><img src={star} alt="" className="size-3.5" />{BigInt(current.pointsPerAward).toLocaleString("ru-RU")} XP</>}
            usages={current.usagesPerAward}
            onEdit={() => setOpen(true)}
          />
        </div>
      ) : null}

      <DialogRoot open={open} onOpenChange={(next) => !actions.isPending && setOpen(next)}>
        <DialogContent className="w-[358px] max-w-[calc(100vw-32px)] sm:max-w-[358px]">
          <DialogHeader>
            <DialogTitle>Награда по промокоду</DialogTitle>
            <DialogDescription>Промокод будет размещён во всех заданиях события.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block">Промокод<Input value={event.promoCodesPrefix} disabled /></label>
            <p className="-mt-2 text-xs text-[#797979]">Префикс задаётся при создании события и дополняется уникальной частью участника.</p>
            <label className="block">Начислять XP<Input inputMode="numeric" value={points} onChange={(e) => setPoints(e.target.value)} /></label>
            <label className="block">Каждые N активаций<Input inputMode="numeric" value={usages} onChange={(e) => setUsages(e.target.value)} /></label>
          </div>
          <DialogFooter>
            {current ? (
              <Button
                type="button"
                variant="outline"
                disabled={actions.isPending}
                onClick={() => actions.mutate(
                  { id: current.id, remove: true },
                  { onSuccess: () => setOpen(false), onError: (error) => toast.error(error.message) },
                )}
              >Удалить</Button>
            ) : null}
            <Button
              disabled={!valid || actions.isPending}
              loading={actions.isPending}
              onClick={() => actions.mutate(
                { id: current?.id, pointsPerAward: points, usagesPerAward: Number(usages) },
                { onSuccess: () => setOpen(false), onError: (error) => toast.error(error.message) },
              )}
            >Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

function EveryonePromoSetup({ event, scope, onDirtyChange }: Props) {
  const rules = useEventPromoRewardRules(event.id);
  const actions = useEventPromoRewardActions(event.id);
  const catalog = useRoomRewards(scope.roomId, { page: 1, size: 100 }, { allPages: true });
  const current = rules.data?.find((rule) => rule.isActive);
  const [open, setOpenState] = useState(false);
  const [rewardId, setRewardId] = useState("");
  const [amount, setAmount] = useState("");
  const [usages, setUsages] = useState("");
  const selected = catalog.rewards.find((reward) => reward.id === rewardId);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onDirtyChange?.(next);
    if (next) {
      setRewardId(current?.reward.rewardId ?? "");
      setAmount(String(current?.reward.amount ?? ""));
      setUsages(String(current?.usagesPerAward ?? ""));
    }
  };
  const validAmount =
    selected &&
    /^\d+(?:\.\d+)?$/.test(amount) &&
    Number(amount) > 0 &&
    (amount.split(".")[1]?.length ?? 0) <= (selected.isDivisible ? selected.divisionPrecision : 0);
  const valid = validAmount && /^[1-9]\d*$/.test(usages) && Number(usages) <= 2147483647;

  return (
    <>
      <PromoCardShell description="Настройте промокод, который будут распространять исполнители">
        {!current && !rules.isLoading ? (
          <Button type="button" size="icon" variant="outline" className="size-7 border-[#e4e4e4] shadow-none" aria-label="Добавить промокод" onClick={() => setOpen(true)}>
            <img src={plus} alt="" />
          </Button>
        ) : null}
      </PromoCardShell>
      {rules.isLoading ? (
        <div className="-mt-px rounded-b-lg border border-[#e4e4e4] p-3"><PageLoader label="Загрузка промокода…" /></div>
      ) : current ? (
        <div className="-mt-px overflow-hidden rounded-b-lg border border-[#e4e4e4] bg-white">
          <RuleSummary
            prefix={event.promoCodesPrefix}
            reward={<><Gift className="size-3.5 text-[#d52094]" aria-hidden />{current.reward.name} · {current.reward.amount.toLocaleString("ru-RU")}</>}
            usages={current.usagesPerAward}
            onEdit={() => setOpen(true)}
          />
        </div>
      ) : null}

      <DialogRoot open={open} onOpenChange={(next) => !actions.isPending && setOpen(next)}>
        <DialogContent className="w-[358px] max-w-[calc(100vw-32px)] sm:max-w-[358px]">
          <DialogHeader>
            <DialogTitle>Награда по промокоду</DialogTitle>
            <DialogDescription>Промокод будет размещён во всех заданиях события.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block">Промокод<Input value={event.promoCodesPrefix} disabled /></label>
            <p className="-mt-2 text-xs text-[#797979]">Префикс задаётся при создании события и дополняется уникальной частью участника.</p>
            <label className="block">Каждые N активаций<Input inputMode="numeric" value={usages} onChange={(e) => setUsages(e.target.value)} /></label>
            <label className="block">Награда
              <Select value={rewardId} onValueChange={setRewardId}>
                <SelectTrigger><SelectValue placeholder="Выберите награду" /></SelectTrigger>
                <SelectContent>{catalog.rewards.filter((reward) => !reward.isDeleted).map((reward) => <SelectItem key={reward.id} value={reward.id}>{reward.name}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="block">Количество<Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
          </div>
          <DialogFooter>
            {current ? (
              <Button type="button" variant="outline" disabled={actions.isPending} onClick={() => actions.mutate(
                { type: "remove", ruleId: current.id },
                { onSuccess: () => setOpen(false), onError: (error) => toast.error(error.message) },
              )}>Удалить</Button>
            ) : null}
            <Button disabled={!valid || actions.isPending} loading={actions.isPending} onClick={() => actions.mutate(
              { type: "save", ruleId: current?.id, rewardId, rewardAmount: Number(amount), usagesPerAward: Number(usages) },
              { onSuccess: () => setOpen(false), onError: (error) => toast.error(error.message) },
            )}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export function EventPromoSetupCard(props: Props) {
  return props.event.type === "contest" ? (
    <ContestPromoSetup {...props} />
  ) : (
    <EveryonePromoSetup {...props} />
  );
}
