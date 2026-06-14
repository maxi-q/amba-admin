import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { OrdIssuanceRuleEditor } from "../ord/components/OrdIssuanceRuleEditor";
import { ORD_COPY } from "../ord/ord.constants";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function OrdTaskIssuanceRulePage() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { room, isLoading: isRoomLoading, isError: isRoomError, error: roomError } = useGetRoomById(
    slug ?? ""
  );
  const { task, isLoading: isTaskLoading, isError: isTaskError, error: taskError } = useCreativeTask(
    taskId ?? ""
  );

  if (isRoomLoading || isTaskLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(roomError, ORD_COPY.roomNotFound)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isTaskError || !task) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(taskError, "Задача не найдена")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-3 pb-6">
      <Link
        to={`/rooms/${slug}/creativetasks/${taskId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        К задаче
      </Link>

      <OrdIssuanceRuleEditor
        scope={{ type: "creativeTask", roomId: room.id, taskId: task.id }}
        roomSlug={slug ?? ""}
        hasOrdProfile={!!room.ordPerson}
        title={`Автовыпуск для задачи «${task.title}»`}
        description="Один шаблон и правило автовыпуска ORD-договоров для участников этой творческой задачи."
        backTo={`/rooms/${slug}/creativetasks/${taskId}`}
        backLabel="К задаче"
        disabled={task.isDeleted}
        disabledText="Для удалённой задачи автовыпуск недоступен."
      />
    </div>
  );
}
