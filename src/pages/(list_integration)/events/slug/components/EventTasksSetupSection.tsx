import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@senler/ui";
import { toast } from "sonner";
import type { EventTaskDto, GetMyEventsResponseItemDto } from "@/api/generated/model";
import { useEventTaskActions } from "@/hooks/events/useEventTaskActions";
import { useEventTasks } from "@/hooks/events/useEventTasks";
import { useRoomRewards } from "@/hooks/rewards/useRoomRewards";
import { TaskPlatform } from "../../../creativetasks/components/TaskPlatform";
import pencil from "@/assets/task-flow/pencil.svg";
import plus from "@/assets/task-flow/plus.svg";
import star from "@/assets/task-flow/star.svg";

type Draft = {
  taskId?: string;
  title: string;
  description: string;
  targetPlatform: "VK_GROUP" | "VK_USER" | "YOUTUBE_CHANNEL" | "RUTUBE_CHANNEL";
  publicationsCount: string;
  criteria: string;
  restrictions: string;
  requireMaterialsReview: boolean;
  requirePublicationReview: boolean;
  experiencePoints: string;
  rewardId: string;
  rewardAmount: string;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  targetPlatform: "VK_USER",
  publicationsCount: "1",
  criteria: "",
  restrictions: "",
  requireMaterialsReview: true,
  requirePublicationReview: true,
  experiencePoints: "100",
  rewardId: "",
  rewardAmount: "1",
};

function fromTask(task: EventTaskDto): Draft {
  return {
    taskId: task.id,
    title: task.title,
    description: task.description ?? "",
    targetPlatform: task.targetPlatform,
    publicationsCount: String(task.publicationsCount),
    criteria: task.criteria?.join("\n") ?? "",
    restrictions: task.restrictions?.join("\n") ?? "",
    requireMaterialsReview: task.requireMaterialsReview,
    requirePublicationReview: task.requirePublicationReview,
    experiencePoints: String(task.experiencePoints),
    rewardId: task.reward?.rewardId ?? "",
    rewardAmount: String(task.reward?.amount ?? 1),
  };
}

export function EventTasksSetupSection({ event }: { event: GetMyEventsResponseItemDto }) {
  const tasks = useEventTasks(event.id);
  const actions = useEventTaskActions(event.id);
  const rewards = useRoomRewards(event.roomId, { page: 1, size: 100 }, { allPages: true });
  const [draft, setDraft] = useState<Draft | null>(null);
  const selectedReward = rewards.rewards.find((reward) => reward.id === draft?.rewardId);
  const precision = selectedReward?.isDivisible ? selectedReward.divisionPrecision : 0;
  const validRewardAmount = Boolean(
    selectedReward &&
    draft &&
    /^\d+(?:\.\d+)?$/.test(draft.rewardAmount) &&
    Number(draft.rewardAmount) > 0 &&
    (draft.rewardAmount.split(".")[1]?.length ?? 0) <= precision,
  );
  const valid = Boolean(
    draft &&
    draft.title.trim().length >= 3 &&
    /^[1-9]\d*$/.test(draft.publicationsCount) &&
    Number(draft.publicationsCount) <= 100 &&
    (event.type === "contest"
      ? /^[1-9]\d*$/.test(draft.experiencePoints)
      : validRewardAmount),
  );
  const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
  const save = () => {
    if (!draft || !valid) return;
    const data = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      targetPlatform: draft.targetPlatform,
      allowedFormats: ["POST" as const],
      publicationsCount: Number(draft.publicationsCount),
      criteria: lines(draft.criteria),
      restrictions: lines(draft.restrictions),
      requireMaterialsReview: draft.requireMaterialsReview,
      requirePublicationReview: draft.requirePublicationReview,
      experiencePoints: event.type === "contest" ? Number(draft.experiencePoints) : 0,
      ...(event.type === "everyone" ? { rewardId: draft.rewardId, rewardAmount: Number(draft.rewardAmount) } : {}),
    };
    actions.mutate(
      draft.taskId ? { type: "update", taskId: draft.taskId, data } : { type: "create", data },
      { onSuccess: () => setDraft(null), onError: (error) => toast.error(error.message) },
    );
  };
  const activeTasks = tasks.tasks.filter((task) => !task.isDeleted);

  return (
    <section className="mt-3 overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-[#e4e4e4] p-4">
        <div><h2 className="text-[15px]">Задания</h2><p className="mt-1 text-[#797979]">Добавьте задания, которые должны выполнить участники</p></div>
        <Button type="button" size="icon" variant="outline" className="size-7 border-[#e4e4e4] shadow-none" aria-label="Добавить задание" onClick={() => setDraft({ ...emptyDraft })}><img src={plus} alt="" /></Button>
      </header>
      {tasks.isLoading ? <div className="p-4"><PageLoader label="Загрузка заданий…" /></div>
        : tasks.isError ? <div className="p-4 text-destructive">Не удалось загрузить задания.<Button variant="outline" className="ml-2" onClick={() => void tasks.refetch()}>Повторить</Button></div>
        : activeTasks.length === 0 ? <p className="p-4 text-[#797979]">Заданий пока нет</p>
        : activeTasks.map((task) => <div key={task.id} className="flex h-12 items-center gap-2 border-b border-[#e4e4e4] px-4 last:border-b-0"><TaskPlatform platform={task.targetPlatform} /><span className="min-w-0 flex-1 truncate">{task.title}</span>{event.type === "contest" ? <span className="flex items-center gap-1"><img src={star} alt="" className="size-3.5" />{task.experiencePoints.toLocaleString("ru-RU")} XP</span> : task.reward ? <span className="max-w-40 truncate text-[#797979]">{task.reward.name} · {task.reward.amount.toLocaleString("ru-RU")}</span> : null}<Button type="button" size="icon" variant="outline" className="size-7 border-[#e4e4e4] shadow-none" aria-label={`Редактировать задание «${task.title}»`} onClick={() => setDraft(fromTask(task))}><img src={pencil} alt="" /></Button></div>)}

      <DialogRoot open={Boolean(draft)} onOpenChange={(open) => !open && !actions.isPending && setDraft(null)}>
        <DialogContent className="max-h-[calc(100dvh-32px)] w-[min(560px,calc(100vw-32px))] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader><DialogTitle>{draft?.taskId ? "Редактировать задание" : "Новое задание"}</DialogTitle><DialogDescription>Укажите информацию, которую увидят участники события.</DialogDescription></DialogHeader>
          {draft ? <div className="space-y-3">
            <label className="block">Название<Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="block">Описание<Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label className="block">Платформа<Select value={draft.targetPlatform} onValueChange={(value) => setDraft({ ...draft, targetPlatform: value as Draft["targetPlatform"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VK_USER">ВКонтакте — профиль</SelectItem><SelectItem value="VK_GROUP">ВКонтакте — сообщество</SelectItem><SelectItem value="YOUTUBE_CHANNEL">YouTube</SelectItem><SelectItem value="RUTUBE_CHANNEL">Rutube</SelectItem></SelectContent></Select></label>
            <label className="block">Количество публикаций<Input inputMode="numeric" value={draft.publicationsCount} onChange={(e) => setDraft({ ...draft, publicationsCount: e.target.value })} /></label>
            <label className="block">Критерии выполнения<Textarea placeholder="Каждый пункт с новой строки" value={draft.criteria} onChange={(e) => setDraft({ ...draft, criteria: e.target.value })} /></label>
            <label className="block">Что запрещено<Textarea placeholder="Каждый пункт с новой строки" value={draft.restrictions} onChange={(e) => setDraft({ ...draft, restrictions: e.target.value })} /></label>
            <CheckBox label="Проверять материалы до публикации" checked={draft.requireMaterialsReview} onCheckedChange={(value) => setDraft({ ...draft, requireMaterialsReview: value === true })} />
            <CheckBox label="Проверять публикацию до начисления награды" checked={draft.requirePublicationReview} onCheckedChange={(value) => setDraft({ ...draft, requirePublicationReview: value === true })} />
            {event.type === "contest" ? <label className="block">Награда за задание, XP<Input inputMode="numeric" value={draft.experiencePoints} onChange={(e) => setDraft({ ...draft, experiencePoints: e.target.value })} /></label> : <div className="grid grid-cols-[1fr_112px] gap-2"><label>Награда<Select value={draft.rewardId} onValueChange={(rewardId) => setDraft({ ...draft, rewardId })}><SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger><SelectContent>{rewards.rewards.filter((reward) => !reward.isDeleted).map((reward) => <SelectItem key={reward.id} value={reward.id}>{reward.name}</SelectItem>)}</SelectContent></Select></label><label>Количество<Input inputMode="decimal" value={draft.rewardAmount} onChange={(e) => setDraft({ ...draft, rewardAmount: e.target.value })} /></label></div>}
          </div> : null}
          <DialogFooter><Button variant="outline" disabled={actions.isPending} onClick={() => setDraft(null)}>Отмена</Button><Button disabled={!valid || actions.isPending} loading={actions.isPending} onClick={save}>Сохранить</Button></DialogFooter>
        </DialogContent>
      </DialogRoot>
    </section>
  );
}
