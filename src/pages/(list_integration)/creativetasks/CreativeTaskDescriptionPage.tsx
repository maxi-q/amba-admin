import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@senler/ui";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { formatDateRange, isTaskActive } from "./utils/creativetaskUtils";

interface OutletCtx {
  task: ICreativeTask;
}

/**
 * Подпункт «Описание» задачи: заголовок, описание, диапазон дат, статус и редактирование.
 */
export default function CreativeTaskDescriptionPage() {
  const { task } = useOutletContext<OutletCtx>();
  const [editOpen, setEditOpen] = useState(false);

  const dateRange = formatDateRange(task.startsAt, task.endsAt);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt);

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
    </>
  );
}
