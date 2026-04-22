import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Badge, Card, CardContent, Button } from "@senler/ui";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import { formatDateRange, isTaskActive } from "../utils/creativetaskUtils";
import { TaskSubmissionsList } from "./TaskSubmissionsList";

interface CreativeTaskCardProps {
  task: ICreativeTask;
  onEdit: (task: ICreativeTask) => void;
}

/**
 * Карточка креативной задачи: заголовок, описание, даты, статус.
 * Раскрывающийся блок с заявками (useSubmissions).
 */
export function CreativeTaskCard({ task, onEdit }: CreativeTaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const dateRange = formatDateRange(task.startsAt, task.endsAt);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt);

  return (
    <Link
      to={`../creativetasks/${task.id}`}
      className={`block overflow-hidden rounded-xl border text-card-foreground no-underline transition-colors hover:border-primary/50 hover:bg-accent/20 ${
        task.isDeleted ? "border-border opacity-60" : "border-border"
      } ${active ? "ring-2 ring-green-600/40 dark:ring-green-500/40" : ""}`}
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={`mb-1 text-lg font-medium leading-snug ${
                  task.isDeleted
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </h3>
              <p
                className={`line-clamp-2 text-sm ${
                  task.isDeleted
                    ? "text-muted-foreground line-through"
                    : "text-muted-foreground"
                }`}
              >
                {task.description || "—"}
              </p>
              <p
                className={`mt-1 text-sm ${
                  task.isDeleted
                    ? "text-muted-foreground line-through"
                    : active
                      ? "font-medium text-green-700 dark:text-green-400"
                      : "text-muted-foreground"
                }`}
              >
                {dateRange}
              </p>
            </div>

            <div
              className="flex shrink-0 items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {!task.isDeleted ? (
                <Badge variant={active ? "success" : "secondary"}>
                  {active ? "Активна" : "Неактивна"}
                </Badge>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded((prev) => !prev);
                }}
                aria-label={expanded ? "Свернуть" : "Развернуть"}
              >
                {expanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(task);
                }}
                aria-label="Редактировать"
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>

          {expanded ? (
            <div
              className="mt-4 border-t border-border pt-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Заявки по задаче
              </p>
              <TaskSubmissionsList taskId={task.id} page={1} size={5} status="pending" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
