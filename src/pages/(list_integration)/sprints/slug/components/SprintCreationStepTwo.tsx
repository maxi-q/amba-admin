import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Pencil, Plus, X } from "lucide-react";
import {
  Button,
  CheckBox,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Input,
  PageLoader,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@senler/ui";
import type { BaseRewardDto } from "@/api/generated/model";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import { SprintCreationHeader } from "./SprintCreationHeader";

export type SprintRewardMode = "rating" | "manual" | "proportional";

export interface DraftRankReward {
  rewardId: string;
  amount: number;
}

export interface DraftRankRule {
  id: string;
  rankFrom: number;
  rankTo: number;
  rewards: DraftRankReward[];
}

export interface DraftProportionalReward {
  amount: string;
  rankTo: string;
}

export type DraftManualReward = DraftRankReward;

interface SprintCreationStepTwoProps {
  roomId: string;
  roomSlug: string;
  mode: SprintRewardMode;
  rankRules: DraftRankRule[];
  proportional: DraftProportionalReward;
  manualRewards: DraftManualReward[];
  onModeChange: (mode: SprintRewardMode) => void;
  onRankRulesChange: (rules: DraftRankRule[]) => void;
  onProportionalChange: (value: DraftProportionalReward) => void;
  onManualRewardsChange: (rewards: DraftManualReward[]) => void;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
}

const ruleLabel = (rule: DraftRankRule) =>
  rule.rankFrom === rule.rankTo
    ? `${rule.rankFrom} место`
    : `${rule.rankFrom}–${rule.rankTo} место`;

const RewardImage = ({ reward }: { reward: BaseRewardDto }) =>
  reward.iconUrl ? (
    <img
      src={reward.iconUrl}
      alt=""
      className="size-10 shrink-0 rounded-md object-cover"
    />
  ) : (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#f0f0f0] text-xs text-[#797979]">
      —
    </div>
  );

const MANUAL_DIALOG_ID = "__manual__";

export const SprintCreationStepTwo = ({
  roomId,
  roomSlug,
  mode,
  rankRules,
  proportional,
  manualRewards,
  onModeChange,
  onRankRulesChange,
  onProportionalChange,
  onManualRewardsChange,
  onBack,
  onContinue,
  onSaveDraft,
}: SprintCreationStepTwoProps) => {
  const { rewards, isLoading: isRewardsLoading } = useRoomRewards(roomId, {
    page: 1,
    size: 100,
    includeDeleted: false,
  });
  const activeRewards = useMemo(
    () => rewards.filter((reward) => !reward.isDeleted),
    [rewards]
  );
  const rewardById = useMemo(
    () => new Map(activeRewards.map((reward) => [reward.id, reward])),
    [activeRewards]
  );

  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("1");
  const [rangeTo, setRangeTo] = useState("1");
  const [rewardDialogRuleId, setRewardDialogRuleId] = useState<string | null>(
    null
  );
  const [rewardDraft, setRewardDraft] = useState<DraftRankReward[]>([]);

  const pool = useMemo(() => {
    const totals = new Map<string, number>();
    for (const rule of rankRules) {
      const places = rule.rankTo - rule.rankFrom + 1;
      for (const reward of rule.rewards) {
        totals.set(
          reward.rewardId,
          (totals.get(reward.rewardId) ?? 0) + reward.amount * places
        );
      }
    }
    return [...totals.entries()];
  }, [rankRules]);

  const openRewardDialog = (rule: DraftRankRule) => {
    setRewardDraft(rule.rewards.map((reward) => ({ ...reward })));
    setRewardDialogRuleId(rule.id);
  };

  const openManualRewardDialog = () => {
    setRewardDraft(manualRewards.map((reward) => ({ ...reward })));
    setRewardDialogRuleId(MANUAL_DIALOG_ID);
  };

  const handleAddRange = () => {
    const from = Number(rangeFrom);
    const to = Number(rangeTo);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) {
      return;
    }

    const id = crypto.randomUUID();
    const nextRule: DraftRankRule = {
      id,
      rankFrom: from,
      rankTo: to,
      rewards: [],
    };
    onRankRulesChange([...rankRules, nextRule]);
    setRangeDialogOpen(false);
    setRewardDraft([]);
    setRewardDialogRuleId(id);
  };

  const toggleReward = (rewardId: string, checked: boolean) => {
    setRewardDraft((previous) =>
      checked
        ? [...previous, { rewardId, amount: 1 }]
        : previous.filter((reward) => reward.rewardId !== rewardId)
    );
  };

  const changeRewardAmount = (rewardId: string, delta: number) => {
    setRewardDraft((previous) =>
      previous.map((reward) =>
        reward.rewardId === rewardId
          ? { ...reward, amount: Math.max(1, reward.amount + delta) }
          : reward
      )
    );
  };

  const changeManualAmount = (rewardId: string, nextAmount: number) => {
    onManualRewardsChange(
      manualRewards.map((reward) =>
        reward.rewardId === rewardId
          ? { ...reward, amount: Math.max(1, nextAmount) }
          : reward
      )
    );
  };

  const removeManualReward = (rewardId: string) => {
    onManualRewardsChange(
      manualRewards.filter((reward) => reward.rewardId !== rewardId)
    );
  };

  const saveRuleRewards = () => {
    if (!rewardDialogRuleId) return;
    if (rewardDialogRuleId === MANUAL_DIALOG_ID) {
      onManualRewardsChange(rewardDraft.map((reward) => ({ ...reward })));
      setRewardDialogRuleId(null);
      return;
    }
    onRankRulesChange(
      rankRules.map((rule) =>
        rule.id === rewardDialogRuleId
          ? { ...rule, rewards: rewardDraft }
          : rule
      )
    );
    setRewardDialogRuleId(null);
  };

  const ratingValid =
    rankRules.length > 0 && rankRules.every((rule) => rule.rewards.length > 0);
  const manualValid = manualRewards.length > 0;
  const proportionalValid =
    Number(proportional.amount) > 0 &&
    Number.isInteger(Number(proportional.rankTo)) &&
    Number(proportional.rankTo) > 0;
  const canContinue =
    mode === "rating"
      ? ratingValid
      : mode === "manual"
        ? manualValid
        : proportionalValid;
  const isManualDialog = rewardDialogRuleId === MANUAL_DIALOG_ID;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <SprintCreationHeader activeStep={2} onSaveDraft={onSaveDraft} />

      <div className="mx-auto mt-9 flex w-full max-w-[700px] flex-col gap-3">
        <TabsRoot
          value={mode}
          onValueChange={(value) => onModeChange(value as SprintRewardMode)}
        >
          <div className="rounded-lg border border-[#e4e4e4] bg-white p-4">
            <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
              Вознаграждение
            </h2>
            <TabsList className="mt-3 w-fit" size="medium">
              <TabsTrigger value="rating">Рейтинг</TabsTrigger>
              <TabsTrigger value="manual">Ручной выбор</TabsTrigger>
              <TabsTrigger value="proportional">Пропорционально</TabsTrigger>
            </TabsList>

            <TabsContent value="rating" className="mt-2">
              <p className="text-[13px] font-medium leading-4 text-[#797979]">
                Награды распределяются по заданным вами местам
              </p>

              <div className="mt-4">
                <p className="text-[13px] font-medium leading-4">Таблица лидеров</p>
                {rankRules.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                    onClick={() => setRangeDialogOpen(true)}
                  >
                    <Plus className="size-4" aria-hidden />
                    Добавить место
                  </Button>
                ) : (
                  <div className="mt-3">
                    <div className="overflow-hidden rounded-md bg-[#fafafa]">
                      {rankRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex min-h-12 items-center gap-4 border-b border-[#e4e4e4] px-3 last:border-b-0"
                        >
                          <span className="w-[105px] shrink-0 text-[13px] font-medium">
                            {ruleLabel(rule)}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                            {rule.rewards.length ? (
                              rule.rewards.map((item) => {
                                const reward = rewardById.get(item.rewardId);
                                if (!reward) return null;
                                return (
                                  <span
                                    key={item.rewardId}
                                    className="inline-flex h-6 items-center gap-1 rounded-md bg-[#f0f0f0] px-1.5 text-[13px]"
                                  >
                                    {reward.name}
                                    {item.amount > 1 ? ` ×${item.amount}` : ""}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[13px] text-[#797979]">
                                Укажите награду
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-7 shrink-0 border-[#e4e4e4] bg-white shadow-none"
                            aria-label="Изменить награды"
                            onClick={() => openRewardDialog(rule)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {pool.length > 0 ? (
                      <div className="flex min-h-12 items-center gap-4 px-3">
                        <span className="w-[105px] shrink-0 text-[13px] font-medium">
                          Итоговый пул
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {pool.map(([rewardId, amount]) => {
                            const reward = rewardById.get(rewardId);
                            return reward ? (
                              <span
                                key={rewardId}
                                className="inline-flex h-6 items-center rounded-md bg-[#f0f0f0] px-1.5 text-[13px]"
                              >
                                {reward.name} ×{amount}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                      onClick={() => setRangeDialogOpen(true)}
                    >
                      <Plus className="size-4" aria-hidden />
                      Добавить место
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-2">
              <p className="text-[13px] font-medium leading-4 text-[#797979]">
                Награды распределяются вами самостоятельно
              </p>

              <div className="mt-4">
                <p className="text-[13px] font-medium leading-4">Награды</p>

                {manualRewards.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                    onClick={openManualRewardDialog}
                  >
                    <Plus className="size-4" aria-hidden />
                    Добавить
                  </Button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-col gap-2">
                      {manualRewards.map((item) => {
                        const reward = rewardById.get(item.rewardId);
                        if (!reward) return null;
                        return (
                          <div
                            key={item.rewardId}
                            className="flex min-h-12 items-center gap-1.5"
                          >
                            <RewardImage reward={reward} />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4">
                              {reward.name}
                            </span>
                            <div className="flex h-7 items-center overflow-hidden rounded-md border border-[#e4e4e4]">
                              <button
                                type="button"
                                className="flex size-7 items-center justify-center border-r border-[#e4e4e4]"
                                onClick={() =>
                                  changeManualAmount(item.rewardId, item.amount - 1)
                                }
                                aria-label="Уменьшить количество"
                              >
                                <Minus className="size-3" />
                              </button>
                              <Input
                                type="number"
                                min={1}
                                value={item.amount}
                                onChange={(event) =>
                                  changeManualAmount(
                                    item.rewardId,
                                    Number(event.target.value) || 1
                                  )
                                }
                                aria-label={`Количество: ${reward.name}`}
                                className="h-7 w-12 rounded-none border-0 px-1 text-center text-[13px] shadow-none"
                              />
                              <button
                                type="button"
                                className="flex size-7 items-center justify-center border-l border-[#e4e4e4]"
                                onClick={() =>
                                  changeManualAmount(item.rewardId, item.amount + 1)
                                }
                                aria-label="Увеличить количество"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-7 shrink-0 border-[#e4e4e4] bg-white shadow-none"
                              aria-label={`Удалить ${reward.name}`}
                              onClick={() => removeManualReward(item.rewardId)}
                            >
                              <X className="size-4" aria-hidden />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                      onClick={openManualRewardDialog}
                    >
                      <Plus className="size-4" aria-hidden />
                      Добавить
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="proportional" className="mt-2">
              <p className="max-w-[668px] text-[13px] font-medium leading-4 text-[#797979]">
                Награды распределяются пропорционально заработанным очкам
              </p>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-2 text-[13px] font-medium leading-4">
                  Общая сумма
                  <Input
                    type="number"
                    min={1}
                    value={proportional.amount}
                    onChange={(event) =>
                      onProportionalChange({
                        ...proportional,
                        amount: event.target.value,
                      })
                    }
                    className="h-10 border-[#e4e4e4] bg-white text-[13px] shadow-none"
                  />
                </label>
                <label className="grid gap-2 text-[13px] font-medium leading-4">
                  Зона вознаграждений
                  <Input
                    type="number"
                    min={1}
                    value={proportional.rankTo}
                    onChange={(event) =>
                      onProportionalChange({
                        ...proportional,
                        rankTo: event.target.value,
                      })
                    }
                    className="h-10 border-[#e4e4e4] bg-white text-[13px] shadow-none"
                  />
                  <span className="text-[13px] font-medium leading-4 text-[#797979]">
                    До какого места распределяется сумма. Например, до 10 места
                  </span>
                </label>
              </div>
            </TabsContent>
          </div>
        </TabsRoot>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-[#e4e4e4] bg-white px-3 text-[13px] shadow-none"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Назад
          </Button>
          <Button
            type="button"
            className="h-10 bg-[#2563eb] px-3 text-[13px] font-medium hover:bg-[#2563eb]/90"
            disabled={!canContinue}
            onClick={onContinue}
          >
            Продолжить
          </Button>
        </div>
      </div>

      <DialogRoot open={rangeDialogOpen} onOpenChange={setRangeDialogOpen}>
        <DialogContent className="max-w-[358px]" showCloseButton>
          <DialogHeader>
            <DialogTitle>Добавить место</DialogTitle>
            <DialogDescription>
              Укажите диапазон мест в таблице лидеров.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Input
              type="number"
              min={1}
              value={rangeFrom}
              onChange={(event) => setRangeFrom(event.target.value)}
              aria-label="Место от"
              className="h-10"
            />
            <span className="text-[13px] text-[#797979]">до</span>
            <Input
              type="number"
              min={1}
              value={rangeTo}
              onChange={(event) => setRangeTo(event.target.value)}
              aria-label="Место до"
              className="h-10"
            />
          </div>
          <DialogFooter>
            <Button type="button" size="sm" onClick={handleAddRange}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(rewardDialogRuleId)}
        onOpenChange={(open) => {
          if (!open) setRewardDialogRuleId(null);
        }}
      >
        <DialogContent className="max-w-[358px]" showCloseButton>
          <DialogHeader>
            <DialogTitle>Награды</DialogTitle>
            <DialogDescription>
              {isManualDialog
                ? "Выберите награды для ручного пула и укажите количество."
                : "Выберите награды и укажите количество для каждого участника."}
            </DialogDescription>
          </DialogHeader>

          {isRewardsLoading ? (
            <PageLoader label="Загрузка наград…" />
          ) : activeRewards.length === 0 ? (
            <div className="py-3 text-center text-[13px] text-[#797979]">
              <p>Наград нет. Создайте их в разделе «Награды».</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to={`/rooms/${roomSlug}/rewards`}>Перейти</Link>
              </Button>
            </div>
          ) : (
            <div className="max-h-[336px] overflow-y-auto">
              {activeRewards.map((reward) => {
                const selected = rewardDraft.find(
                  (item) => item.rewardId === reward.id
                );
                return (
                  <div
                    key={reward.id}
                    className="flex min-h-14 items-center gap-2 border-b border-[#e4e4e4] py-1 last:border-b-0"
                  >
                    <CheckBox
                      checked={Boolean(selected)}
                      onCheckedChange={(checked) =>
                        toggleReward(reward.id, checked === true)
                      }
                      aria-label={`Выбрать ${reward.name}`}
                    />
                    <RewardImage reward={reward} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                      {reward.name}
                    </span>
                    {selected ? (
                      <div className="flex h-7 items-center overflow-hidden rounded-md border border-[#e4e4e4]">
                        <button
                          type="button"
                          className="flex size-7 items-center justify-center border-r border-[#e4e4e4]"
                          onClick={() => changeRewardAmount(reward.id, -1)}
                          aria-label="Уменьшить количество"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-[13px]">
                          {selected.amount}
                        </span>
                        <button
                          type="button"
                          className="flex size-7 items-center justify-center border-l border-[#e4e4e4]"
                          onClick={() => changeRewardAmount(reward.id, 1)}
                          aria-label="Увеличить количество"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              disabled={activeRewards.length > 0 && rewardDraft.length === 0}
              onClick={saveRuleRewards}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
