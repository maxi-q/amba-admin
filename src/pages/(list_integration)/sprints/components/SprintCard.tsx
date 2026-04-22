import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, CardContent } from "@senler/ui";
import type { ISprint } from "@services/sprints/sprints.types";
import { formatDateRange, isSprintActive } from "../utils/sprintUtils";
import { checkSprintStatus } from "../constants/sprintStatus";

interface SprintCardProps {
  sprint: ISprint;
}

export const SprintCard = ({ sprint }: SprintCardProps) => {
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
  const active = sprint.ignoreEndDate
    ? true
    : isSprintActive(sprint.startDate, sprint.endDate);
  const { label, color } = checkSprintStatus(
    sprint.startDate,
    sprint.endDate,
    sprint.ignoreEndDate
  );

  const badgeVariant =
    color === "success" ? "success" : color === "warning" ? "warning" : "secondary";

  return (
    <Link
      to={`${sprint.id}`}
      className={`block rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-accent/30 ${
        sprint.isDeleted ? "opacity-60" : ""
      }`}
    >
      <Card className="border-0 shadow-none">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p
              className={`mb-1 text-lg font-medium leading-tight ${
                sprint.isDeleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {sprint.name}
            </p>
            <p
              className={`text-sm ${
                sprint.isDeleted
                  ? "text-muted-foreground line-through"
                  : active
                    ? "font-medium text-green-700 dark:text-green-400"
                    : "text-muted-foreground"
              }`}
            >
              {dateRange}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!sprint.isDeleted ? (
              <Badge variant={badgeVariant}>{label}</Badge>
            ) : null}
            <Pencil className="size-4 text-muted-foreground" aria-hidden />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
