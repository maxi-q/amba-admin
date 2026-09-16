import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Badge, Card, CardContent, Button } from "@senler/ui";
import type { BaseCreativeTaskDto } from "@/api/generated/model";
import { formatBallsReward, formatTaskFormat } from "../utils/creativetaskUtils";
import { TaskSubmissionsList } from "./TaskSubmissionsList";

interface CreativeTaskCardProps {
  task: BaseCreativeTaskDto;
  onEdit: (task: BaseCreativeTaskDto) => void;
}

/**
 * Карточка креативной задачи: заголовок, описание и статус.
 * Раскрывающийся блок с заявками (useSubmissions).
 */
export function CreativeTaskCard({ task, onEdit }: CreativeTaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Link
      to={`../creativetasks/${task.id}`}
      className={`block overflow-hidden rounded-xl border text-card-foreground no-underline transition-colors hover:border-primary/50 hover:bg-accent/20 ${
        task.isDeleted ? "border-border opacity-60" : "border-border"
      }`}
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
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {formatBallsReward(task.minimalRewardInBalls)}
                </Badge>
                {task.allowedFormats?.length ? (
                  task.allowedFormats.slice(0, 3).map((format) => (
                    <Badge key={format} variant="outline" className="font-normal">
                      {formatTaskFormat(format)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="font-normal">
                    Любой формат
                  </Badge>
                )}
                {(task.allowedFormats?.length ?? 0) > 3 ? (
                  <Badge variant="outline" className="font-normal">
                    +{(task.allowedFormats?.length ?? 0) - 3}
                  </Badge>
                ) : null}
              </div>
              {task.criteria?.length ? (
                <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                  Критерии: {task.criteria.join("; ")}
                </p>
              ) : null}
            </div>

            <div
              className="flex shrink-0 items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Badge variant={task.isFrozen ? "outline" : "secondary"}>
                {task.isDeleted ? "Удалена" : task.isFrozen ? "Остановлено" : "В спринте"}
              </Badge>
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
              <TaskSubmissionsList taskId={task.id} page={1} size={5} status="waiting_for_review_materials" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
