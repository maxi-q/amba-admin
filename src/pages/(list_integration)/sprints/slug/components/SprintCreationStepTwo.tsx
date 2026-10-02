import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Ellipsis,
  Gift,
  Minus,
  Pencil,
  Plus,
  Redo2,
  Search,
  Trash2,
  TriangleAlert,
  Undo2,
  User,
  Users,
  X,
} from "lucide-react";
import {
  Button,
  CheckBox,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
  PageLoader,
  Switch,
} from "@senler/ui";
import type { BaseRewardDto, RewardSummaryDto } from "@/api/generated/model";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import {
  distributeRewardPool,
  isValidRewardRange,
  rankParticipants,
  rankRewardPlaceCount,
  rankRewardsForParticipant,
  sumRewardAmounts,
} from "@/utils/sprintRewardPreview";
import { SprintCreationHeader } from "./SprintCreationHeader";

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
  rankFrom?: string;
  rankTo: string;
  minPoints: string;
  rewards: DraftRankReward[];
}

export type DraftManualReward = DraftRankReward;

interface SprintCreationStepTwoProps {
  roomId: string;
  roomSlug: string;
  rankRules: DraftRankRule[];
  proportional: DraftProportionalReward;
  manualRewards: DraftManualReward[];
  pinnedRewards?: RewardSummaryDto[];
  onRankRulesChange: (rules: DraftRankRule[]) => void;
  onProportionalChange: (value: DraftProportionalReward) => void;
  onManualRewardsChange: (rewards: DraftManualReward[]) => void;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  showWizardControls?: boolean;
}

type PlaceDialogKind = "single" | "range" | "manual";
type RewardPresentation = Pick<BaseRewardDto, "id" | "name" | "iconUrl" | "isDivisible" | "divisionPrecision">;

interface PreviewParticipant {
  id: string;
  name: string;
  points: number;
  color: string;
}

const PREVIEW_PARTICIPANTS: PreviewParticipant[] = [
  { id: "sergey", name: "Сергей", points: 1000, color: "#ff5420" },
  { id: "anzhelika", name: "Анжелика", points: 500, color: "#ffb520" },
  { id: "dmitry", name: "Дмитрий", points: 400, color: "#c020ff" },
];

const MANUAL_DIALOG_ID = "__manual__";
const PROPORTIONAL_DIALOG_ID = "__proportional__";
const numberFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 10 });

const ruleLabel = (rule: DraftRankRule) =>
  rule.rankFrom === rule.rankTo
    ? `${rule.rankFrom} место`
    : `${rule.rankFrom}–${rule.rankTo} место`;

const RewardImage = ({ reward }: { reward: RewardPresentation }) =>
  reward.iconUrl ? (
    <img
      src={reward.iconUrl}
      alt=""
      className="size-12 shrink-0 rounded-lg border border-[#e4e4e4] object-cover"
    />
  ) : (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e4] bg-[#f0f0f0] text-xs text-[#797979]">
      <Gift className="size-5" aria-hidden />
    </div>
  );

const RewardChip = ({
  reward,
  amount,
}: {
  reward: RewardPresentation;
  amount: number;
}) => {
  const isMoney = /руб|₽/i.test(reward.name);

  return (
    <span className="inline-flex h-6 max-w-full items-center gap-0.5 rounded-[13px] bg-[#f0f0f0] px-1.5 text-[13px] font-medium leading-4">
      {isMoney ? (
        <Banknote className="size-3.5 shrink-0 text-[#26c464]" aria-hidden />
      ) : (
        <Gift className="size-3.5 shrink-0 text-[#d52094]" aria-hidden />
      )}
      <span className="truncate">
        {isMoney ? numberFormatter.format(amount) : reward.name}
      </span>
      <span className="shrink-0 text-[#797979]">
        {isMoney ? "₽" : numberFormatter.format(amount)}
      </span>
    </span>
  );
};

const RewardPreviewItem = ({
  reward,
  amount,
}: {
  reward: RewardPresentation;
  amount: number;
}) => {
  const isMoney = /руб|₽/i.test(reward.name);

  return (
    <div className="flex h-12 items-center gap-1.5">
      <RewardImage reward={reward} />
      {isMoney ? (
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-4">
          {numberFormatter.format(amount)} ₽
        </p>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-[13px] font-medium leading-4">
          <p className="truncate">{reward.name}</p>
          <p className="text-[#797979]">{numberFormatter.format(amount)} шт.</p>
        </div>
      )}
    </div>
  );
};

const RuleActions = ({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="flex shrink-0 gap-1">
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-7 border-[#e4e4e4] bg-white shadow-none"
      aria-label={editLabel}
      onClick={onEdit}
    >
      <Pencil className="size-4" aria-hidden />
    </Button>
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-7 border-[#e4e4e4] bg-white shadow-none"
      aria-label={deleteLabel}
      onClick={onDelete}
    >
      <X className="size-4" aria-hidden />
    </Button>
  </div>
);

export const SprintCreationStepTwo = ({
  roomId,
  roomSlug,
  rankRules,
  proportional,
  manualRewards,
  pinnedRewards,
  onRankRulesChange,
  onProportionalChange,
  onManualRewardsChange,
  onBack,
  onContinue,
  onSaveDraft,
  showWizardControls = true,
}: SprintCreationStepTwoProps) => {
  const {
    rewards,
    isLoading: isRewardsLoading,
    isError: isRewardsError,
    refetch: refetchRewards,
  } = useRoomRewards(roomId, {
    page: 1,
    size: 100,
    includeDeleted: false,
  }, { allPages: true });
  const activeRewards = useMemo(
    () => rewards.filter((reward) => !reward.isDeleted),
    [rewards]
  );
  const rewardById = useMemo(() => new Map<string, RewardPresentation>([
    ...activeRewards.map((reward) => [reward.id, reward] as const),
    ...(pinnedRewards ?? []).map((reward) => [reward.id, reward] as const),
  ]), [activeRewards, pinnedRewards]);

  const [placeDialogOpen, setPlaceDialogOpen] = useState(false);
  const [placeDialogKind, setPlaceDialogKind] =
    useState<PlaceDialogKind>("single");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState("1");
  const [rangeTo, setRangeTo] = useState("1");
  const [distributeProportionally, setDistributeProportionally] =
    useState(false);
  const [rewardDraft, setRewardDraft] = useState<DraftRankReward[]>([]);
  const dialogRewards = useMemo(() => [...new Set([
    ...activeRewards.map((reward) => reward.id),
    ...rewardDraft.map((reward) => reward.rewardId),
  ])].flatMap((id) => {
    const reward = rewardById.get(id);
    return reward ? [reward] : [];
  }), [activeRewards, rewardDraft, rewardById]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [previewTab, setPreviewTab] = useState<"distribution" | "all">(
    "distribution"
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewHistory, setPreviewHistory] = useState<PreviewParticipant[][]>([
    PREVIEW_PARTICIPANTS,
  ]);
  const [previewHistoryIndex, setPreviewHistoryIndex] = useState(0);

  const ratingPool = useMemo(() => {
    const totals = new Map<string, number>();
    for (const rule of rankRules) {
      const places = rankRewardPlaceCount(rule);
      for (const reward of rule.rewards) {
        totals.set(
          reward.rewardId,
          Number(((totals.get(reward.rewardId) ?? 0) + reward.amount * places).toFixed(10))
        );
      }
    }
    return [...totals.entries()];
  }, [rankRules]);

  const proportionalRewards = proportional.rewards ?? [];
  const allPool = useMemo(() => {
    const totals = new Map(ratingPool);
    for (const reward of proportionalRewards) {
      totals.set(
        reward.rewardId,
        Number(((totals.get(reward.rewardId) ?? 0) + reward.amount).toFixed(10))
      );
    }
    return [...totals.entries()];
  }, [proportionalRewards, ratingPool]);

  const participants = previewHistory[previewHistoryIndex] ?? PREVIEW_PARTICIPANTS;
  const rankedParticipants = useMemo(() => rankParticipants(participants), [participants]);
  const visibleParticipants = useMemo(
    () => rankedParticipants.filter(({ participant }) =>
          participant.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        ),
    [rankedParticipants, searchQuery]
  );

  const hasProportionalRule = proportionalRewards.length > 0;
  const hasManualRule = manualRewards.length > 0;
  const ruleIds = [
    ...rankRules.map((rule) => rule.id),
    ...(hasProportionalRule ? [PROPORTIONAL_DIALOG_ID] : []),
    ...(hasManualRule ? [MANUAL_DIALOG_ID] : []),
  ];
  const maxRewardedRank = Math.max(
    0,
    ...rankRules.map((rule) => rule.rankTo),
    Number(proportional.rankTo) || 0
  );

  const allRulesSelected =
    ruleIds.length > 0 && selectedRuleIds.length === ruleIds.length;
  const hasUnsupportedProportionalRange = distributeProportionally && (!Number.isSafeInteger(Number(rangeFrom)) || Number(rangeFrom) < 1);
  const isPlaceRangeValid = placeDialogKind === "manual" || (
    distributeProportionally && rangeTo === ""
      ? Number.isSafeInteger(Number(rangeFrom)) && Number(rangeFrom) >= 1
      : isValidRewardRange(
          Number(rangeFrom),
          placeDialogKind === "single" ? Number(rangeFrom) : Number(rangeTo),
          distributeProportionally
        )
  );

  const openNewPlaceDialog = () => {
    setEditingRuleId(null);
    setPlaceDialogKind("single");
    setDistributeProportionally(false);
    setRangeFrom("1");
    setRangeTo("1");
    setRewardDraft([]);
    setPlaceDialogOpen(true);
  };

  const openRuleDialog = (rule: DraftRankRule) => {
    setEditingRuleId(rule.id);
    setPlaceDialogKind(rule.rankFrom === rule.rankTo ? "single" : "range");
    setDistributeProportionally(false);
    setRangeFrom(String(rule.rankFrom));
    setRangeTo(String(rule.rankTo));
    setRewardDraft(rule.rewards.map((reward) => ({ ...reward })));
    setPlaceDialogOpen(true);
  };

  const openManualDialog = () => {
    setEditingRuleId(MANUAL_DIALOG_ID);
    setPlaceDialogKind("manual");
    setDistributeProportionally(false);
    setRewardDraft(manualRewards.map((reward) => ({ ...reward })));
    setPlaceDialogOpen(true);
  };

  const openProportionalDialog = () => {
    setEditingRuleId(PROPORTIONAL_DIALOG_ID);
    setPlaceDialogKind("range");
    setDistributeProportionally(true);
    setRangeFrom(proportional.rankFrom ?? "1");
    setRangeTo(proportional.rankTo);
    setRewardDraft(proportionalRewards.map((reward) => ({ ...reward })));
    setPlaceDialogOpen(true);
  };

  const toggleReward = (rewardId: string, checked: boolean) => {
    setRewardDraft((previous) =>
      checked
        ? [...previous, { rewardId, amount: 1 }]
        : previous.filter((reward) => reward.rewardId !== rewardId)
    );
  };

  const setRewardAmount = (reward: RewardPresentation, amount: number) => {
    const precision = reward.isDivisible ? reward.divisionPrecision : 0;
    const multiplier = 10 ** precision;
    const minimum = 1 / multiplier;
    if (!Number.isFinite(amount * multiplier)) return;
    setRewardDraft((previous) =>
      previous.map((item) =>
        item.rewardId === reward.id
          ? {
              ...item,
              amount: Math.max(
                minimum,
                Math.round((amount || minimum) * multiplier) / multiplier
              ),
            }
          : item
      )
    );
  };

  const savePlace = () => {
    if (rewardDraft.length === 0) return;

    const editingRankRuleId =
      editingRuleId &&
      editingRuleId !== MANUAL_DIALOG_ID &&
      editingRuleId !== PROPORTIONAL_DIALOG_ID
        ? editingRuleId
        : null;

    if (placeDialogKind === "manual") {
      onManualRewardsChange(rewardDraft.map((reward) => ({ ...reward })));
      if (editingRankRuleId) {
        onRankRulesChange(
          rankRules.filter((rule) => rule.id !== editingRankRuleId)
        );
      }
      if (editingRuleId === PROPORTIONAL_DIALOG_ID) {
        onProportionalChange({
          amount: "",
          rankTo: "",
          minPoints: "",
          rewards: [],
        });
      }
      if (editingRuleId && editingRuleId !== MANUAL_DIALOG_ID) {
        setSelectedRuleIds((selected) =>
          selected.filter((id) => id !== editingRuleId)
        );
      }
      setPlaceDialogOpen(false);
      return;
    }

    const from = Number(rangeFrom);
    const to = placeDialogKind === "single" ? from : Number(rangeTo);
    if (!isPlaceRangeValid) {
      return;
    }

    if (distributeProportionally) {
      onProportionalChange({
        rankFrom: String(from),
        amount: String(
          rewardDraft.reduce((total, reward) => total + reward.amount, 0)
        ),
        rankTo: rangeTo === "" ? "" : String(to),
        minPoints:
          editingRuleId === PROPORTIONAL_DIALOG_ID
            ? proportional.minPoints || (rangeTo === "" ? "0" : "")
            : rangeTo === "" ? "0" : "",
        rewards: rewardDraft.map((reward) => ({ ...reward })),
      });
      if (editingRankRuleId) {
        onRankRulesChange(
          rankRules.filter((rule) => rule.id !== editingRankRuleId)
        );
      }
      if (editingRuleId === MANUAL_DIALOG_ID) onManualRewardsChange([]);
      if (editingRuleId && editingRuleId !== PROPORTIONAL_DIALOG_ID) {
        setSelectedRuleIds((selected) =>
          selected.filter((id) => id !== editingRuleId)
        );
      }
      setPlaceDialogOpen(false);
      return;
    }

    const nextRule: DraftRankRule = {
      id: editingRankRuleId ?? crypto.randomUUID(),
      rankFrom: from,
      rankTo: to,
      rewards: rewardDraft.map((reward) => ({ ...reward })),
    };

    onRankRulesChange(
      editingRankRuleId
        ? rankRules.map((rule) => (rule.id === editingRuleId ? nextRule : rule))
        : [...rankRules, nextRule]
    );
    if (editingRuleId === MANUAL_DIALOG_ID) onManualRewardsChange([]);
    if (editingRuleId === PROPORTIONAL_DIALOG_ID) {
      onProportionalChange({
        amount: "",
        rankTo: "",
        minPoints: "",
        rewards: [],
      });
    }
    if (
      editingRuleId === MANUAL_DIALOG_ID ||
      editingRuleId === PROPORTIONAL_DIALOG_ID
    ) {
      setSelectedRuleIds((selected) =>
        selected.filter((id) => id !== editingRuleId)
      );
    }
    setPlaceDialogOpen(false);
  };

  const removeRules = (ids: string[]) => {
    onRankRulesChange(rankRules.filter((rule) => !ids.includes(rule.id)));
    if (ids.includes(PROPORTIONAL_DIALOG_ID)) {
      onProportionalChange({
        amount: "",
        rankTo: "",
        minPoints: "",
        rewards: [],
      });
    }
    if (ids.includes(MANUAL_DIALOG_ID)) onManualRewardsChange([]);
    setSelectedRuleIds((selected) => selected.filter((id) => !ids.includes(id)));
  };

  const updateParticipantPoints = (participantId: string, points: number) => {
    const nextParticipants = participants.map((participant) =>
      participant.id === participantId
        ? { ...participant, points: Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.trunc(points || 0))) }
        : participant
    );
    const nextHistory = [
      ...previewHistory.slice(0, previewHistoryIndex + 1),
      nextParticipants,
    ];
    setPreviewHistory(nextHistory);
    setPreviewHistoryIndex(nextHistory.length - 1);
  };

  const canContinue =
    ruleIds.length > 0 &&
    rankRules.every((rule) => rule.rewards.length > 0);

  const proportionalAmounts = useMemo(() => {
    const proportionalRankTo = Number(proportional.rankTo) || 0;
    const proportionalMinPoints =
      proportional.minPoints === "" ? null : Number(proportional.minPoints);
    const eligibleParticipants = rankedParticipants
      .filter(({ participant, rank }) =>
          rank >= Number(proportional.rankFrom || 1) && (proportionalRankTo === 0 || rank <= proportionalRankTo) &&
          (proportionalMinPoints === null ||
            participant.points >= proportionalMinPoints))
      .map(({ participant }) => participant);
    return new Map(
      (hasProportionalRule ? proportionalRewards : []).map((reward) => {
        const rewardData = rewardById.get(reward.rewardId);
        const precision = rewardData?.isDivisible
          ? rewardData.divisionPrecision
          : 0;
        return [reward.rewardId, distributeRewardPool(reward.amount, precision, eligibleParticipants)];
      })
    );
  }, [rankedParticipants, proportional.rankFrom, proportional.rankTo, proportional.minPoints, hasProportionalRule, proportionalRewards, rewardById]);

  const rewardsForParticipant = (participant: PreviewParticipant, rank: number) =>
    sumRewardAmounts([
      ...rankRewardsForParticipant(rankRules, rank),
      ...proportionalRewards.map((reward) => ({
        rewardId: reward.rewardId,
        amount: proportionalAmounts.get(reward.rewardId)?.get(participant.id) ?? 0,
      })),
    ]).filter((reward) => reward.amount > 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {showWizardControls ? (
        <SprintCreationHeader activeStep={2} onSaveDraft={onSaveDraft} />
      ) : null}

      <div
        className={`flex min-w-0 flex-1 ${
          showWizardControls ? "min-h-[664px]" : "min-h-0"
        }`}
      >
        <main className="min-w-0 flex-1 px-4 py-4">
          <div className="mx-auto w-full max-w-[648px]">
            <div className="rounded-lg border border-[#e4e4e4] bg-white p-4">
              <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
                Призовые места
              </h2>
              <p className="mt-1 text-[13px] font-medium leading-4 text-[#797979]">
                Какие награды получит конкретное место в рейтинге
              </p>

              {ruleIds.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-[#e4e4e4]">
                  <div className="flex h-12 items-center gap-3 border-b border-[#e4e4e4] px-3">
                    <CheckBox
                      checked={
                        allRulesSelected
                          ? true
                          : selectedRuleIds.length > 0
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) =>
                        setSelectedRuleIds(checked === true ? ruleIds : [])
                      }
                      aria-label="Выбрать все места"
                    />
                    <span className="min-w-0 flex-1 text-[13px] font-medium leading-4">
                      Выбрано: {selectedRuleIds.length}
                    </span>
                    <DropdownMenuRoot>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-7 border-[#e4e4e4] bg-white shadow-none"
                          aria-label="Действия с выбранными местами"
                        >
                          <Ellipsis className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={selectedRuleIds.length === 0}
                          onClick={() => removeRules(selectedRuleIds)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuRoot>
                  </div>

                  {rankRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex min-h-12 items-center gap-3 border-b border-[#e4e4e4] px-3 py-2 last:border-b-0"
                    >
                      <CheckBox
                        checked={selectedRuleIds.includes(rule.id)}
                        onCheckedChange={(checked) =>
                          setSelectedRuleIds((selected) =>
                            checked === true
                              ? [...selected, rule.id]
                              : selected.filter((id) => id !== rule.id)
                          )
                        }
                        aria-label={`Выбрать ${ruleLabel(rule)}`}
                      />
                      <span className="w-[110px] shrink-0 text-[13px] font-medium leading-4">
                        {ruleLabel(rule)}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                        {rule.rewards.map((item) => {
                          const reward = rewardById.get(item.rewardId);
                          return reward ? (
                            <RewardChip
                              key={item.rewardId}
                              reward={reward}
                              amount={item.amount}
                            />
                          ) : null;
                        })}
                      </div>
                      <RuleActions
                        editLabel={`Изменить ${ruleLabel(rule)}`}
                        deleteLabel={`Удалить ${ruleLabel(rule)}`}
                        onEdit={() => openRuleDialog(rule)}
                        onDelete={() => removeRules([rule.id])}
                      />
                    </div>
                  ))}

                  {hasProportionalRule ? (
                    <div className="flex min-h-12 items-center gap-3 border-b border-[#e4e4e4] px-3 py-2 last:border-b-0">
                      <CheckBox
                        checked={selectedRuleIds.includes(PROPORTIONAL_DIALOG_ID)}
                        onCheckedChange={(checked) =>
                          setSelectedRuleIds((selected) =>
                            checked === true
                              ? [...selected, PROPORTIONAL_DIALOG_ID]
                              : selected.filter(
                                  (id) => id !== PROPORTIONAL_DIALOG_ID
                                )
                          )
                        }
                        aria-label="Выбрать пропорциональное распределение"
                      />
                      <div className="w-[110px] shrink-0">
                        <p className="text-[13px] font-medium leading-4">
                          {proportional.rankTo
                            ? `${proportional.rankFrom || 1}–${proportional.rankTo} место`
                            : proportional.minPoints !== ""
                              ? `от ${proportional.minPoints} XP`
                              : "Все места"}
                        </p>
                        <p className="text-[13px] font-medium leading-4 text-[#797979]">
                          Пропорционально
                          {proportional.rankTo && proportional.minPoints !== ""
                            ? ` · от ${proportional.minPoints} XP`
                            : ""}
                        </p>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                        {proportionalRewards.map((item) => {
                          const reward = rewardById.get(item.rewardId);
                          return reward ? (
                            <RewardChip
                              key={item.rewardId}
                              reward={reward}
                              amount={item.amount}
                            />
                          ) : null;
                        })}
                      </div>
                      <RuleActions
                        editLabel="Изменить пропорциональное распределение"
                        deleteLabel="Удалить пропорциональное распределение"
                        onEdit={openProportionalDialog}
                        onDelete={() => removeRules([PROPORTIONAL_DIALOG_ID])}
                      />
                    </div>
                  ) : null}

                  {hasManualRule ? (
                    <div className="flex min-h-12 items-center gap-3 border-b border-[#e4e4e4] px-3 py-2 last:border-b-0">
                      <CheckBox
                        checked={selectedRuleIds.includes(MANUAL_DIALOG_ID)}
                        onCheckedChange={(checked) =>
                          setSelectedRuleIds((selected) =>
                            checked === true
                              ? [...selected, MANUAL_DIALOG_ID]
                              : selected.filter((id) => id !== MANUAL_DIALOG_ID)
                          )
                        }
                        aria-label="Выбрать ручной отбор"
                      />
                      <span className="w-[110px] shrink-0 text-[13px] font-medium leading-4">
                        Ручной отбор
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                        {manualRewards.map((item) => {
                          const reward = rewardById.get(item.rewardId);
                          return reward ? (
                            <RewardChip
                              key={item.rewardId}
                              reward={reward}
                              amount={item.amount}
                            />
                          ) : null;
                        })}
                      </div>
                      <RuleActions
                        editLabel="Изменить ручной отбор"
                        deleteLabel="Удалить ручной отбор"
                        onEdit={openManualDialog}
                        onDelete={() => removeRules([MANUAL_DIALOG_ID])}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-7 border-[#e4e4e4] bg-white px-2 text-[13px] shadow-none"
                onClick={openNewPlaceDialog}
              >
                <Plus className="size-4" aria-hidden />
                Добавить место
              </Button>
            </div>

            {showWizardControls ? (
              <div className="mt-3 flex items-center justify-between">
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
            ) : null}
          </div>
        </main>

        <aside className="block w-[260px] shrink-0 border-l border-[#e4e4e4] bg-white">
          {ruleIds.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-[13px] font-medium leading-4 text-[#797979]">
              Здесь будут отображаться
              <br />
              все награды
            </div>
          ) : (
            <>
              <div className="p-4 pb-0">
            <div
              className="flex rounded-md bg-[#f0f0f0] p-0.5"
              role="group"
              aria-label="Режим предпросмотра наград"
            >
              <button
                type="button"
                aria-pressed={previewTab === "distribution"}
                className={`flex-1 rounded px-1.5 py-1 text-[13px] font-medium leading-4 ${
                  previewTab === "distribution" ? "bg-white" : ""
                }`}
                onClick={() => setPreviewTab("distribution")}
              >
                Как делятся
              </button>
              <button
                type="button"
                aria-pressed={previewTab === "all"}
                className={`flex-1 rounded px-1.5 py-1 text-[13px] font-medium leading-4 ${
                  previewTab === "all" ? "bg-white" : ""
                }`}
                onClick={() => setPreviewTab("all")}
              >
                Все награды
              </button>
            </div>
            {previewTab === "distribution" ? (
              <p className="mt-2 text-[13px] font-medium leading-4 text-[#797979]">
                Посмотрите, как награды будут распределяться относительно набранных XP
              </p>
            ) : null}
          </div>

              {previewTab === "distribution" ? (
            <>
              <div className="flex h-16 items-center gap-2 px-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={previewHistoryIndex === 0}
                  onClick={() => setPreviewHistoryIndex((index) => index - 1)}
                  aria-label="Отменить изменение XP"
                >
                  <Undo2 className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={previewHistoryIndex === previewHistory.length - 1}
                  onClick={() => setPreviewHistoryIndex((index) => index + 1)}
                  aria-label="Вернуть изменение XP"
                >
                  <Redo2 className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setIsSearchOpen((open) => !open)}
                  aria-label="Поиск участника"
                  aria-pressed={isSearchOpen}
                >
                  <Search className="size-4" aria-hidden />
                </Button>
                <span className="flex-1" />
                <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#e4e4e4] px-1.5 text-[13px] font-medium">
                  <Users className="size-4" aria-hidden />
                  {participants.length}
                </span>
              </div>

              {isSearchOpen ? (
                <div className="flex items-center gap-2 px-4 pb-3">
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Имя участника"
                    className="h-8 text-[13px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    aria-label="Закрыть поиск"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              ) : null}

              {maxRewardedRank > participants.length ? (
                <div className="mx-4 mb-3 flex gap-2 rounded-[10px] bg-[#f0f0f0] p-2 text-[13px] font-medium leading-4">
                  <TriangleAlert
                    className="size-4 shrink-0 text-[#ff8a00]"
                    aria-hidden
                  />
                  <span>
                    Участников меньше, чем диапазон победителей. Превью будет отображаться некорректно
                  </span>
                </div>
              ) : null}

              <div>
                {visibleParticipants.map(({ participant, rank }) => {
                  const participantRewards = rewardsForParticipant(
                    participant,
                    rank
                  );
                  return (
                    <div
                      key={participant.id}
                      className="border-b border-[#e4e4e4] p-4 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium">{rank}.</span>
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: participant.color }}
                        >
                          <User className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                          {participant.name}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          value={participant.points}
                          onChange={(event) =>
                            updateParticipantPoints(
                              participant.id,
                              Number(event.target.value)
                            )
                          }
                          aria-label={`XP: ${participant.name}`}
                          className="h-7 w-[60px] rounded-lg px-1.5 text-center text-[13px] shadow-none"
                        />
                      </div>
                      {participantRewards.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {participantRewards.map((item, rewardIndex) => {
                            const reward = rewardById.get(item.rewardId);
                            return reward ? (
                              <RewardChip
                                key={`${item.rewardId}-${rewardIndex}`}
                                reward={reward}
                                amount={item.amount}
                              />
                            ) : null;
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
              ) : (
                <div className="p-4 pt-3">
              <div className="flex flex-col gap-1 text-[13px] font-medium leading-4">
                <p>Награды рейтинга</p>
                <p className="text-[#797979]">
                  Распределяются по количеству XP
                </p>
              </div>
              {allPool.length > 0 ? (
                <div className="mt-2 flex flex-col gap-2">
                  {allPool.map(([rewardId, amount]) => {
                    const reward = rewardById.get(rewardId);
                    return reward ? (
                      <RewardPreviewItem
                        key={rewardId}
                        reward={reward}
                        amount={amount}
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="mt-2 text-[13px] font-medium leading-4 text-[#797979]">
                  Награды ещё не добавлены
                </p>
              )}
              {hasManualRule ? (
                <div className="mt-4">
                  <div className="flex flex-col gap-1 text-[13px] font-medium leading-4">
                    <p>Ручной отбор</p>
                    <p className="text-[#797979]">Распределяются вручную</p>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {manualRewards.map((item) => {
                      const reward = rewardById.get(item.rewardId);
                      return reward ? (
                        <RewardPreviewItem
                          key={item.rewardId}
                          reward={reward}
                          amount={item.amount}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              ) : null}
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      <DialogRoot open={placeDialogOpen} onOpenChange={setPlaceDialogOpen}>
        <DialogContent className="!max-w-[358px] gap-0 p-0" showCloseButton>
          <DialogHeader className="px-4 pb-0 pt-2.5">
            <DialogTitle>Место</DialogTitle>
            <DialogDescription className="sr-only">
              Настройте место и количество наград
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 py-1.5">
            <div
              className="flex rounded-md bg-[#f0f0f0] p-0.5"
              role="group"
              aria-label="Тип распределения наград"
            >
              {(
                [
                  ["single", "Одиночное"],
                  ["range", "Диапазон"],
                  ["manual", "Ручной отбор"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={placeDialogKind === value}
                  className={`flex-1 rounded px-1.5 py-1 text-[13px] font-medium leading-4 ${
                    placeDialogKind === value ? "bg-white" : ""
                  }`}
                  onClick={() => {
                    setPlaceDialogKind(value);
                    if (value !== "range") setDistributeProportionally(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {placeDialogKind === "manual" ? (
              <p className="mt-3 text-[13px] font-medium leading-4 text-[#797979]">
                Награды будут распределяться вами самостоятельно
              </p>
            ) : placeDialogKind === "single" ? (
              <Input
                type="number"
                min={1}
                value={rangeFrom}
                onChange={(event) => setRangeFrom(event.target.value)}
                aria-label="Место"
                className="mt-3 h-10"
              />
            ) : (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={rangeFrom}
                    onChange={(event) => setRangeFrom(event.target.value)}
                    aria-label="Место от"
                    aria-invalid={hasUnsupportedProportionalRange}
                    aria-describedby="proportional-range-label"
                    className="h-10"
                  />
                  <span className="text-[13px] text-[#797979]">до</span>
                  <Input
                    type="number"
                    min={1}
                    value={rangeTo}
                    onChange={(event) => setRangeTo(event.target.value)}
                    aria-label="Место до"
                    placeholder={distributeProportionally ? "Без ограничения" : undefined}
                    className="h-10"
                  />
                </div>
                <label id="proportional-range-label" className="mt-2 flex items-center gap-2.5 text-[13px] font-medium leading-4">
                  <Switch
                    checked={distributeProportionally}
                    onCheckedChange={setDistributeProportionally}
                  />
                  {hasUnsupportedProportionalRange
                    ? "Укажите целое место от 1"
                    : "Распределить пропорционально XP"}
                </label>
              </div>
            )}
          </div>

          {isRewardsLoading ? (
            <div className="px-4 py-4">
              <PageLoader label="Загрузка наград…" />
            </div>
          ) : isRewardsError ? (
            <div
              className="px-4 py-5 text-center text-[13px] text-[#797979]"
              role="alert"
            >
              <p className="text-[15px] font-medium leading-5 text-black">
                Не удалось загрузить награды
              </p>
              <p className="mt-1">Проверьте соединение и попробуйте ещё раз</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void refetchRewards()}
              >
                Повторить
              </Button>
            </div>
          ) : dialogRewards.length === 0 ? (
            <div className="px-4 py-5 text-center text-[13px] text-[#797979]">
              <p className="text-[15px] font-medium leading-5 text-black">
                Нужно добавить награды
              </p>
              <p className="mt-1">Это можно сделать в разделе «Награды»</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to={`/rooms/${roomSlug}/rewards`}>Перейти</Link>
              </Button>
            </div>
          ) : (
            <div className="max-h-[336px] overflow-y-auto px-2.5 pt-1.5">
              {dialogRewards.map((reward) => {
                const selected = rewardDraft.find(
                  (item) => item.rewardId === reward.id
                );
                const step = reward.isDivisible
                  ? 1 / 10 ** reward.divisionPrecision
                  : 1;
                return (
                  <div
                    key={reward.id}
                    className="flex min-h-14 items-center gap-1.5 rounded-lg px-1.5 py-1"
                  >
                    <CheckBox
                      checked={Boolean(selected)}
                      onCheckedChange={(checked) =>
                        toggleReward(reward.id, checked === true)
                      }
                      aria-label={`Выбрать ${reward.name}`}
                    />
                    <RewardImage reward={reward} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4">
                      {reward.name}
                    </span>
                    <div
                      className={`flex h-7 items-center overflow-hidden rounded-lg border border-[#e4e4e4] ${
                        selected ? "" : "opacity-50"
                      }`}
                    >
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center border-r border-[#e4e4e4]"
                        disabled={!selected}
                        onClick={() =>
                          setRewardAmount(reward, (selected?.amount ?? step) - step)
                        }
                        aria-label="Уменьшить количество"
                      >
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <Input
                        type="number"
                        min={step}
                        step={step}
                        disabled={!selected}
                        value={selected?.amount ?? 0}
                        onChange={(event) =>
                          setRewardAmount(reward, Number(event.target.value))
                        }
                        aria-label={`Количество: ${reward.name}`}
                        className="h-7 w-12 rounded-none border-0 px-1 text-center text-[13px] shadow-none"
                      />
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center border-l border-[#e4e4e4]"
                        disabled={!selected}
                        onClick={() =>
                          setRewardAmount(reward, (selected?.amount ?? 0) + step)
                        }
                        aria-label="Увеличить количество"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="px-4 py-2.5">
            <Button
              type="button"
              size="sm"
              disabled={
                isRewardsError ||
                !isPlaceRangeValid ||
                dialogRewards.length === 0 ||
                rewardDraft.length === 0
              }
              onClick={savePlace}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
