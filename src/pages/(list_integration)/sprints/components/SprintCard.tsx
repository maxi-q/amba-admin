import { Link, useParams } from "react-router-dom";
import type { BaseSprintDto } from "@/api/generated/model";
import { formatDateRange } from "../utils/sprintUtils";
import { checkSprintStatus, statusToneStyles } from "../constants/sprintStatus";

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
    sprint.ignoreEndDate
  );
  const toneStyle = statusToneStyles[tone];

  return (
    <Link
      to={`/rooms/${slug}/sprints/${sprint.id}`}
      className={`flex min-h-12 items-center gap-3 border-b border-[#e4e4e4] px-4 py-3 transition-colors hover:bg-[#fafafa] ${
        sprint.isDeleted ? "opacity-60" : ""
      }`}
    >
      <p
        className={`min-w-0 flex-1 truncate text-[13px] font-medium leading-4 ${
          sprint.isDeleted
            ? "text-muted-foreground line-through"
            : "text-foreground"
        }`}
      >
        {sprint.name}
      </p>

      {!sprint.isDeleted ? (
        <span
          className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-1.5 text-[13px] font-medium leading-4 ${toneStyle.chip}`}
        >
          <span className={`size-2 shrink-0 rounded-full ${toneStyle.dot}`} />
          {label}
        </span>
      ) : null}

      <span
        className={`w-[147px] shrink-0 text-right text-[13px] font-medium leading-4 ${
          sprint.isDeleted
            ? "text-muted-foreground line-through"
            : "text-[#797979]"
        }`}
      >
        {dateRange}
      </span>
    </Link>
  );
};
