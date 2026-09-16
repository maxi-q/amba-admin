import { Link, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@senler/ui";
import type { GetMySprintsResponseItemDto } from "@/api/generated/model";
import { useDeleteSprint } from "@/hooks/sprints/useDeleteSprint";
import { formatDateRange } from "../utils/sprintUtils";
import { checkSprintStatus } from "../constants/sprintStatus";

interface SprintCardProps {
  sprint: GetMySprintsResponseItemDto;
}

export const SprintCard = ({ sprint }: SprintCardProps) => {
  const { slug } = useParams();
  const { deleteSprint, isPending: isDeleting } = useDeleteSprint(slug ?? "");
  const dateRange =
    sprint.isDraft && !sprint.startDate
      ? "Дата не указана"
      : formatDateRange(
          sprint.startDate,
          sprint.ignoreEndDate ? null : sprint.endDate
        );
  const { label, tone } = checkSprintStatus(
    sprint.startDate,
    sprint.endDate,
    sprint.ignoreEndDate,
    sprint.status
  );
  const statusLabel = sprint.isDraft
    ? "Черновик"
    : sprint.status === "awarding"
      ? "Выдача наград"
      : sprint.status === "completed"
        ? "Завершен"
        : label;
  const statusDotClass = sprint.isDraft
    ? "border-[#a3a3a3]"
    : sprint.status === "awarding"
      ? "border-[#26c464]"
      : sprint.status === "completed" || tone === "ended"
        ? "border-[#a3a3a3]"
        : tone === "planned"
          ? "border-[#f97316]"
          : "border-[#26c464]";
  const startsInFuture =
    sprint.startDate != null && new Date(sprint.startDate).getTime() > Date.now();
  const canDelete =
    sprint.isDraft || (sprint.status === "active" && startsInFuture);

  const handleDelete = () => {
    const sprintName = sprint.name?.trim() || "Без названия";
    if (!window.confirm(`Удалить спринт «${sprintName}»?`)) return;

    deleteSprint(sprint.id, {
      onSuccess: () => toast.success("Спринт удалён"),
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Не удалось удалить спринт"
        ),
    });
  };

  return (
    <div className="flex h-12 items-center border-b border-[#e4e4e4] px-4 transition-colors hover:bg-[#fafafa]">
      <Link
        to={`/rooms/${slug}/sprints/${sprint.id}${sprint.isDraft ? "/edit" : ""}`}
        className="flex min-w-0 flex-1 items-center gap-4 self-stretch"
      >
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <p className="min-w-0 truncate text-[13px] font-medium leading-4 text-foreground">
            {sprint.name?.trim() || "Без названия"}
          </p>
          {(sprint.tasksToReviewCount ?? 0) > 0 ? (
            <span
              className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[28px] bg-[rgba(213,32,148,0.15)] px-1.5 text-[13px] font-medium leading-4 text-[#d52094]"
              aria-label={`Заданий на проверке: ${sprint.tasksToReviewCount}`}
            >
              {sprint.tasksToReviewCount}
            </span>
          ) : null}
        </div>

        <span className="inline-flex h-6 shrink-0 items-center gap-0.5 rounded-[28px] border border-[#e4e4e4] bg-white px-1.5 text-[13px] font-medium leading-4 text-foreground">
          <span className="flex size-4 shrink-0 items-center justify-center">
            <span className={`size-2 rounded-full border ${statusDotClass}`} />
          </span>
          {statusLabel}
        </span>

        <span className="w-[147px] shrink-0 whitespace-nowrap text-right text-[13px] font-medium leading-4 text-[#797979]">
          {dateRange}
        </span>

        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#e4e4e4] bg-white"
          aria-hidden
        >
          <Pencil className="size-4 text-[#707070]" strokeWidth={1.5} />
        </span>
      </Link>

      {canDelete ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-1 size-7 shrink-0 border-[#e4e4e4] bg-white shadow-none"
          disabled={isDeleting}
          onClick={handleDelete}
          aria-label="Удалить спринт"
        >
          <Trash2 className="size-4 text-[#707070]" strokeWidth={1.5} />
        </Button>
      ) : null}
    </div>
  );
};
