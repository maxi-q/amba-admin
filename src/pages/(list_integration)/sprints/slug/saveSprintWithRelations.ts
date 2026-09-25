import type {
  BaseSprintDto,
  CreateCreativeTaskRequestDto,
  CreateRewardRuleRequestDto,
  CreateSprintRequestDto,
  UpdateCreativeTaskRequestDto,
  UpdateRewardRuleRequestDto,
  UpdateSprintRequestDto,
} from "@/api/generated/model";
import { isValidRewardRange } from "../../../../utils/sprintRewardPreview.ts";

/** Confirmed server IDs survive a failed save while the editor stays open. */
export interface SprintSaveProgress {
  sprintId?: string;
  ruleIds: Record<string, string>;
  taskIds: Record<string, string>;
}

type SavedSprint = Pick<BaseSprintDto, "id" | "roomId" | "isDraft">;

export async function saveSprintWithRelations({
  progress,
  roomId,
  data,
  publish,
  rules,
  tasks,
  actions,
}: {
  progress: SprintSaveProgress;
  roomId: string;
  data: UpdateSprintRequestDto;
  publish: boolean;
  rules: Array<{ key: string; data: CreateRewardRuleRequestDto }>;
  tasks: Array<{
    key: string;
    createData: CreateCreativeTaskRequestDto;
    updateData: UpdateCreativeTaskRequestDto;
  }>;
  actions: {
    createSprint: (data: CreateSprintRequestDto) => Promise<SavedSprint>;
    updateSprint: (args: { sprintId: string; data: UpdateSprintRequestDto }) => Promise<SavedSprint>;
    createRule: (args: { sprintId: string; data: CreateRewardRuleRequestDto }) => Promise<{ id: string }>;
    updateRule: (args: { id: string; data: UpdateRewardRuleRequestDto }) => Promise<unknown>;
    deleteRule: (id: string) => Promise<unknown>;
    createTask: (data: CreateCreativeTaskRequestDto) => Promise<{ id: string }>;
    updateTask: (args: { id: string; data: UpdateCreativeTaskRequestDto }) => Promise<unknown>;
  };
}) {
  for (const { data: rule } of rules) {
    if (rule.type === "byRank" && !isValidRewardRange(rule.rankFrom ?? 0, rule.rankTo ?? 0, false)) {
      throw new Error("Укажите корректный диапазон призовых мест");
    }
    if (rule.type === "byPoints" && (
      (rule.rankFrom != null && rule.rankFrom !== 1) ||
      (rule.rankTo != null && (!Number.isSafeInteger(rule.rankTo) || rule.rankTo < 1)) ||
      (rule.minPoints != null && (!Number.isSafeInteger(rule.minPoints) || rule.minPoints < 0))
    )) {
      throw new Error("Проверьте ограничения пропорционального распределения: места начинаются с первого, баллы не могут быть отрицательными");
    }
    if (rule.rewards.length === 0 || rule.rewards.some((reward) => !reward.rewardId || !Number.isFinite(Number(reward.amount)) || Number(reward.amount) <= 0)) {
      throw new Error("Для каждого правила выберите награды и укажите количество больше нуля");
    }
  }
  if (!progress.sprintId) {
    const created = await actions.createSprint({ roomId, isDraft: true });
    progress.sprintId = created.id;
  }

  // Publication is deliberately separate: no incomplete new sprint becomes active.
  const { isDraft: _isDraft, ...settings } = data;
  void _isDraft;
  let savedSprint = await actions.updateSprint({ sprintId: progress.sprintId, data: settings });

  // ponytail: this in-memory checkpoint covers confirmed writes, not a lost POST response.
  // Exactly-once retries across network failures/reloads need server idempotency keys.
  for (const rule of rules) {
    const id = progress.ruleIds[rule.key];
    if (id) {
      await actions.updateRule({ id, data: rule.data });
    } else {
      const created = await actions.createRule({ sprintId: savedSprint.id, data: rule.data });
      progress.ruleIds[rule.key] = created.id;
    }
  }

  for (const task of tasks) {
    const id = progress.taskIds[task.key];
    if (id) {
      await actions.updateTask({ id, data: { ...task.updateData, sprintId: savedSprint.id } });
    } else {
      const created = await actions.createTask({ ...task.createData, sprintId: savedSprint.id });
      progress.taskIds[task.key] = created.id;
    }
  }

  // Keep the old relations until every replacement has been saved successfully.
  const keptRules = new Set(rules.map((rule) => rule.key));
  for (const [key, id] of Object.entries(progress.ruleIds)) {
    if (!keptRules.has(key)) {
      await actions.deleteRule(id);
      delete progress.ruleIds[key];
    }
  }
  const keptTasks = new Set(tasks.map((task) => task.key));
  for (const [key, id] of Object.entries(progress.taskIds)) {
    if (!keptTasks.has(key)) {
      await actions.updateTask({ id, data: { isDeleted: true } });
      delete progress.taskIds[key];
    }
  }

  if (publish && savedSprint.isDraft) {
    savedSprint = await actions.updateSprint({ sprintId: savedSprint.id, data: { isDraft: false } });
  }
  return savedSprint;
}
