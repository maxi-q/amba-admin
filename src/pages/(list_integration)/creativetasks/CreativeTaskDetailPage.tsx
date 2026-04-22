import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import { TaskDetailSubmissionsList } from "./components/TaskDetailSubmissionsList";
import { CreativeTaskWhitelistSection } from "./components/CreativeTaskWhitelistSection";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { formatDateRange, isTaskActive } from "./utils/creativetaskUtils";
import { Badge, Button, Card, CardContent, PageLoader } from "@senler/ui";

export default function CreativeTaskDetailPage() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { task, isLoading, isError, error, refetch } = useCreativeTask(taskId ?? "");
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <CreativeTasksErrorState
        errorMessage={(error as Error)?.message ?? "Задача не найдена"}
      />
    );
  }

  const dateRange = formatDateRange(task.startsAt, task.endsAt);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt);

  return (
    <div className="w-full px-2 py-3">
      <Link
        to={`/rooms/${slug ?? ""}/creativetasks`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        К списку креативных задач
      </Link>

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
        onSuccess={() => {
          void refetch();
        }}
      />

      <TaskDetailSubmissionsList taskId={task.id} />

      <CreativeTaskWhitelistSection task={task} />
    </div>
  );
}
