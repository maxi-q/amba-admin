import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  InputField,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import type {
  CreateRewardRuleRequestDto,
  CreateRewardRuleRequestDtoType,
  SprintRewardRuleDto,
} from "@/api/generated/model";
import { CreateRewardRuleRequestDtoType as RewardRuleTypeEnum } from "@/api/generated/model/createRewardRuleRequestDtoType";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import {
  useCreateSprintRewardRule,
  useDeleteSprintRewardRule,
  useSprintRewardRules,
  useUpdateSprintRewardRule,
} from "@/hooks/sprints/useSprintRewardRules";

type RewardLine = { rewardId: string; amount: string };

type RuleFormState = {
  type: CreateRewardRuleRequestDtoType;
  rankFrom: string;
  rankTo: string;
  minPoints: string;
  rewards: RewardLine[];
};

const emptyForm = (): RuleFormState => ({
  type: RewardRuleTypeEnum.byRank,
  rankFrom: "1",
  rankTo: "1",
  minPoints: "",
  rewards: [{ rewardId: "", amount: "1" }],
});

function ruleToForm(rule: SprintRewardRuleDto): RuleFormState {
  return {
    type: rule.type,
    rankFrom: rule.rankFrom != null ? String(rule.rankFrom) : "",
    rankTo: rule.rankTo != null ? String(rule.rankTo) : "",
    minPoints: rule.minPoints != null ? String(rule.minPoints) : "",
    rewards: rule.rewards.length
      ? rule.rewards.map((item) => ({
          rewardId: item.rewardId,
          amount: String(item.amount),
        }))
      : [{ rewardId: "", amount: "1" }],
  };
}

function formToPayload(form: RuleFormState): CreateRewardRuleRequestDto | null {
  const rewards = form.rewards
    .filter((item) => item.rewardId && Number(item.amount) > 0)
    .map((item) => ({
      rewardId: item.rewardId,
      amount: Number(item.amount),
    }));

  if (rewards.length === 0) return null;

  if (form.type === "byRank") {
    const rankFrom = Number(form.rankFrom);
    const rankTo = Number(form.rankTo);
    if (!rankFrom || !rankTo || rankFrom > rankTo) return null;
    return {
      type: "byRank",
      rankFrom,
      rankTo,
      minPoints: null,
      rewards,
    };
  }

  return {
    type: "byPoints",
    rankFrom: null,
    rankTo: form.rankTo ? Number(form.rankTo) : null,
    minPoints: form.minPoints ? Number(form.minPoints) : null,
    rewards,
  };
}

function describeRule(rule: SprintRewardRuleDto): string {
  if (rule.type === "byRank") {
    return `Места ${rule.rankFrom ?? "?"}–${rule.rankTo ?? "?"}`;
  }
  const parts = ["По баллам"];
  if (rule.rankTo != null) parts.push(`до ${rule.rankTo} места`);
  if (rule.minPoints != null) parts.push(`от ${rule.minPoints} баллов`);
  return parts.join(", ");
}

interface SprintRewardRulesSectionProps {
  sprintId: string;
  roomId: string;
  roomSlug: string;
  disabled?: boolean;
}

export function SprintRewardRulesSection({
  sprintId,
  roomId,
  roomSlug,
  disabled = false,
}: SprintRewardRulesSectionProps) {
  const { rules, isLoading, refetch } = useSprintRewardRules(sprintId);
  const { rewards, isLoading: isRewardsLoading } = useRoomRewards(roomId, {
    page: 1,
    size: 100,
  });
  const activeRewards = useMemo(
    () => rewards.filter((reward) => !reward.isDeleted),
    [rewards]
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SprintRewardRuleDto | null>(null);
  const [form, setForm] = useState<RuleFormState>(emptyForm);
  const [clientError, setClientError] = useState("");

  const { createRule, isPending: isCreating, generalError: createError } =
    useCreateSprintRewardRule(sprintId);
  const { updateRule, isPending: isUpdating, generalError: updateError } =
    useUpdateSprintRewardRule(sprintId);
  const { deleteRule, isPending: isDeleting } = useDeleteSprintRewardRule(sprintId);

  const isPending = isCreating || isUpdating || isDeleting;
  const generalError = createError || updateError;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setClientError("");
    setSheetOpen(true);
  };

  const openEdit = (rule: SprintRewardRuleDto) => {
    setEditing(rule);
    setForm(ruleToForm(rule));
    setClientError("");
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    const payload = formToPayload(form);
    if (!payload) {
      setClientError("Заполните тип, места/баллы и хотя бы одну награду с количеством.");
      return;
    }
    setClientError("");

    if (editing) {
      updateRule(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Правило обновлено");
            setSheetOpen(false);
            void refetch();
          },
        }
      );
      return;
    }

    createRule(payload, {
      onSuccess: () => {
        toast.success("Правило создано");
        setSheetOpen(false);
        void refetch();
      },
    });
  };

  const handleDelete = (rule: SprintRewardRuleDto) => {
    if (!window.confirm("Удалить правило выдачи наград?")) return;
    deleteRule(rule.id, {
      onSuccess: () => {
        toast.success("Правило удалено");
        void refetch();
      },
    });
  };

  if (sprintId === "new") {
    return (
      <Alert>
        <AlertDescription>
          Сначала сохраните спринт — затем можно настроить правила выдачи наград.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || isRewardsLoading) {
    return (
      <div className="flex justify-center py-6">
        <PageLoader label="Загрузка правил…" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Правила выдачи наград</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Как распределяются награды из каталога по местам или баллам лидерборда.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={disabled || activeRewards.length === 0}>
          <Plus className="mr-1 size-4" />
          Добавить правило
        </Button>
      </div>

      {activeRewards.length === 0 ? (
        <Alert>
          <AlertDescription>
            Сначала создайте награды в каталоге.{" "}
            <Link
              to={`/rooms/${roomSlug}/rewards`}
              className="font-medium text-primary underline underline-offset-2"
            >
              Перейти к наградам
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">Правил пока нет.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="border border-border shadow-none">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {rule.type === "byRank" ? "По местам" : "По баллам"}
                    </Badge>
                    <Badge variant="outline">{describeRule(rule)}</Badge>
                  </div>
                  <ul className="space-y-1 text-sm text-foreground">
                    {rule.rewards.map((item) => (
                      <li key={item.id}>
                        {item.reward.name} × {item.amount}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(rule)}
                    disabled={disabled || isPending}
                  >
                    Изменить
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Удалить правило"
                    onClick={() => handleDelete(rule)}
                    disabled={disabled || isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex !h-[100dvh] !max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0"
        >
          <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setSheetOpen(false)}
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </Button>
            <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
              {editing ? "Изменить правило" : "Новое правило"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
            {generalError || clientError ? (
              <Alert variant="destructive">
                <AlertDescription>{generalError || clientError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Тип распределения</p>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value as CreateRewardRuleRequestDtoType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="byRank">По местам</SelectItem>
                  <SelectItem value="byPoints">По баллам (пропорционально)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.type === "byRank" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Место с *</p>
                  <InputField
                    type="number"
                    min={1}
                    value={form.rankFrom}
                    onChange={(e) => setForm((prev) => ({ ...prev, rankFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Место по *</p>
                  <InputField
                    type="number"
                    min={1}
                    value={form.rankTo}
                    onChange={(e) => setForm((prev) => ({ ...prev, rankTo: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">До места включительно</p>
                  <InputField
                    type="number"
                    min={1}
                    value={form.rankTo}
                    onChange={(e) => setForm((prev) => ({ ...prev, rankTo: e.target.value }))}
                    placeholder="Необязательно"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Мин. баллов</p>
                  <InputField
                    type="number"
                    min={0}
                    value={form.minPoints}
                    onChange={(e) => setForm((prev) => ({ ...prev, minPoints: e.target.value }))}
                    placeholder="Необязательно"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Награды *</p>
              {form.rewards.map((line, index) => (
                <div key={index} className="flex flex-col gap-2 sm:flex-row">
                  <Select
                    value={line.rewardId || undefined}
                    onValueChange={(value) =>
                      setForm((prev) => {
                        const next = [...prev.rewards];
                        next[index] = { ...next[index], rewardId: value };
                        return { ...prev, rewards: next };
                      })
                    }
                  >
                    <SelectTrigger className="sm:flex-1">
                      <SelectValue placeholder="Выберите награду" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeRewards.map((reward) => (
                        <SelectItem key={reward.id} value={reward.id}>
                          {reward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputField
                    type="number"
                    min={1}
                    value={line.amount}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...prev.rewards];
                        next[index] = { ...next[index], amount: e.target.value };
                        return { ...prev, rewards: next };
                      })
                    }
                    aria-label="Количество"
                    className="sm:w-28"
                  />
                  {form.rewards.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Удалить награду"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          rewards: prev.rewards.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    rewards: [...prev.rewards, { rewardId: "", amount: "1" }],
                  }))
                }
              >
                <Plus className="mr-1 size-4" />
                Ещё награда
              </Button>
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isPending}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Сохранение…" : editing ? "Сохранить" : "Создать"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
