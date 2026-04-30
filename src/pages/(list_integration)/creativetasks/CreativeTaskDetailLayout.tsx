import { Link, Outlet, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { CreativeTaskDetailHeader } from "./components/CreativeTaskDetailHeader";
import { PageLoader } from "@senler/ui";

/**
 * Лэйаут страницы задачи: общий бэк-линк к списку задач и Outlet для подпунктов
 * (описание / ответы на задачу / приглашения в задачу).
 */
export default function CreativeTaskDetailLayout() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { task, isLoading, isError, error } = useCreativeTask(taskId ?? "");

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

  return (
    <div className="w-full px-2 py-3">
      <Link
        to={`/rooms/${slug ?? ""}/creativetasks`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        К списку задач
      </Link>

      <CreativeTaskDetailHeader />

      <Outlet context={{ task }} />
    </div>
  );
}
