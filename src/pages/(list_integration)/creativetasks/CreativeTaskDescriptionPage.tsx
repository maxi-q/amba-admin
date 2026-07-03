import { useOutletContext, useParams } from "react-router-dom";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@senler/ui";
import type { CreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { formatBallsReward, formatDateRange, formatTaskFormat, isTaskActive } from "./utils/creativetaskUtils";
import { OrdCreativeSummaryCard } from "./components/OrdCreativeSummaryCard";

interface OutletCtx {
  task: CreativeTaskWithDefaultsDto;
}

/**
 * Подпункт «Описание» задачи: заголовок, описание, диапазон дат, статус и редактирование.
 */
export default function CreativeTaskDescriptionPage() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { task } = useOutletContext<OutletCtx>();
  const [editOpen, setEditOpen] = useState(false);

  const dateRange = formatDateRange(task.startsAt, task.endsAt ?? null);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt ?? null);

  return (
    <>
      <Card
        className={`mb-4 border border-border ${task.isDeleted ? "opacity-70" : ""}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                className={`text-xl font-semibold tracking-tight sm:text-2xl ${
                  task.isDeleted ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {task.title}
              </h1>
              <p
                className={`mt-1 whitespace-pre-wrap text-sm sm:text-base ${
                  task.isDeleted
                    ? "text-muted-foreground line-through"
                    : "text-muted-foreground"
                }`}
              >
                {task.description || "—"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{dateRange}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">
                  {formatBallsReward(task.minimalRewardInBalls)}
                </Badge>
                {task.allowedFormats?.length ? (
                  task.allowedFormats.map((format) => (
                    <Badge key={format} variant="outline">
                      {formatTaskFormat(format)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">Любой формат</Badge>
                )}
              </div>
              {task.criteria?.length ? (
                <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-sm font-medium text-foreground">Критерии выполнения</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {task.criteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {!task.isDeleted ? (
                <Badge variant={active ? "success" : "secondary"}>
                  {active ? "Активна" : "Неактивна"}
                </Badge>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(true)}
                className="text-primary"
                aria-label="Редактировать задачу"
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditCreativeTaskDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
      />

      <OrdCreativeSummaryCard task={task} slug={slug ?? ""} taskId={taskId ?? ""} />
    </>
  );
}
