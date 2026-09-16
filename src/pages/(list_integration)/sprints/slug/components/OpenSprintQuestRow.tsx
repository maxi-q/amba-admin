import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CirclePause, CirclePlay } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@senler/ui";
import { useFreezeCreativeTask } from "@/hooks/creativetasks/useFreezeCreativeTask";
import { useUnfreezeCreativeTask } from "@/hooks/creativetasks/useUnfreezeCreativeTask";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { StopCreativeTaskDialog } from "@/pages/(list_integration)/creativetasks/components/StopCreativeTaskDialog";

interface OpenSprintQuestRowProps {
  taskId: string;
  title: string;
  roomSlug: string;
  isFrozen: boolean;
}

function answersLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ответ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} ответа`;
  }
  return `${count} ответов`;
}

export function OpenSprintQuestRow({
  taskId,
  title,
  roomSlug,
  isFrozen,
}: OpenSprintQuestRowProps) {
  const [stopOpen, setStopOpen] = useState(false);
  const [frozen, setFrozen] = useState(isFrozen);
  const {
    freezeCreativeTask,
    isPending: isFreezing,
    generalError: freezeError,
  } = useFreezeCreativeTask();
  const {
    unfreezeCreativeTask,
    isPending: isUnfreezing,
    generalError: unfreezeError,
  } = useUnfreezeCreativeTask();
  const { submissions, pagination, isLoading } = useSubmissions(taskId, {
    page: 1,
    size: 100,
  });
  const total = pagination?.total ?? submissions.length;
  const pending = submissions.filter(
    (item) =>
      item.status === "new" ||
      item.status === "waiting_for_review_materials" ||
      item.status === "waiting_for_review_publication"
  ).length;
  const allReviewed = total > 0 && pending === 0;
  const isChangingFrozenState = isFreezing || isUnfreezing;

  useEffect(() => setFrozen(isFrozen), [isFrozen]);

  const handleFrozenStateChange = () => {
    const mutation = frozen ? unfreezeCreativeTask : freezeCreativeTask;
    mutation(
      { id: taskId },
      {
        onSuccess: () => {
          setFrozen(!frozen);
          setStopOpen(false);
          toast.success(frozen ? "Задание возобновлено" : "Задание остановлено");
        },
      },
    );
  };

  let badge: React.ReactNode;
  if (frozen) {
    badge = (
      <span className="inline-flex items-center rounded-[28px] border border-[#e4e4e4] bg-white px-1.5 py-1 text-[13px] font-medium leading-4 text-[#797979]">
        Остановлено
      </span>
    );
  } else if (isLoading) {
    badge = (
      <span className="text-[13px] font-medium text-[#797979]">…</span>
    );
  } else if (total === 0) {
    badge = (
      <span className="inline-flex items-center rounded-[28px] bg-[#f0f0f0] px-1.5 py-1 text-[13px] font-medium leading-4 text-[#797979]">
        Ответов нет
      </span>
    );
  } else if (allReviewed) {
    badge = (
      <span className="inline-flex items-center gap-1 rounded-[28px] bg-[#f0f0f0] px-1.5 py-1 text-[13px] font-medium leading-4 text-foreground">
        <Check className="size-3 shrink-0 text-[#55a32a]" aria-hidden />
        Все проверено
      </span>
    );
  } else {
    badge = (
      <span className="inline-flex items-center rounded-[28px] bg-[rgba(213,32,148,0.15)] px-1.5 py-1 text-[13px] font-medium leading-4 text-[#d52094]">
        {answersLabel(total)}
      </span>
    );
  }

  return (
    <>
      <div className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4 transition-colors hover:bg-[#fafafa]">
        <Link
          to={`/rooms/${roomSlug}/creativetasks/${taskId}/answers`}
          className="flex min-w-0 flex-1 items-center gap-4 self-stretch"
        >
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
            {title}
          </p>
          {badge}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0 border-[#e4e4e4] bg-white shadow-none"
          onClick={() => setStopOpen(true)}
          disabled={isChangingFrozenState}
          aria-label={`${frozen ? "Возобновить" : "Остановить"} задание «${title}»`}
          title={frozen ? "Возобновить задание" : "Остановить задание"}
        >
          {frozen ? (
            <CirclePlay className="size-4" strokeWidth={1.5} aria-hidden />
          ) : (
            <CirclePause className="size-4" strokeWidth={1.5} aria-hidden />
          )}
        </Button>
      </div>
      <StopCreativeTaskDialog
        open={stopOpen}
        onOpenChange={setStopOpen}
        isFrozen={frozen}
        isPending={isChangingFrozenState}
        errorMessage={frozen ? unfreezeError : freezeError}
        onConfirm={handleFrozenStateChange}
      />
    </>
  );
}
