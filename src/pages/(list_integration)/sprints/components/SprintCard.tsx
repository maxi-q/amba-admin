import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import type { BaseSprintDto } from "@/api/generated/model";
import { formatDateRange } from "../utils/sprintUtils";
import { checkSprintStatus } from "../constants/sprintStatus";

interface SprintCardProps {
  sprint: BaseSprintDto;
}

export const SprintCard = ({ sprint }: SprintCardProps) => {
  const { slug } = useParams();
  const dateRange = formatDateRange(
    sprint.startDate,
    sprint.ignoreEndDate ? null : sprint.endDate
  );
  const { label, tone } = checkSprintStatus(
    sprint.startDate,
    sprint.endDate,
    sprint.ignoreEndDate,
    sprint.status
  );
  const statusLabel =
    sprint.status === "awarding"
      ? "Выдача наград"
      : sprint.status === "completed"
        ? "Завершен"
        : label;
  const statusDotClass =
    sprint.status === "awarding"
      ? "border-[#26c464]"
      : sprint.status === "completed" || tone === "ended"
        ? "border-[#a3a3a3]"
        : tone === "planned"
          ? "border-[#f97316]"
          : "border-[#26c464]";

  return (
    <Link
      to={`/rooms/${slug}/sprints/${sprint.id}`}
      className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4 transition-colors hover:bg-[#fafafa]"
    >
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 text-foreground">
        {sprint.name}
      </p>

      <span
        className="inline-flex h-6 shrink-0 items-center gap-0.5 rounded-[28px] border border-[#e4e4e4] bg-white px-1.5 text-[13px] font-medium leading-4 text-foreground"
      >
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
  );
};
