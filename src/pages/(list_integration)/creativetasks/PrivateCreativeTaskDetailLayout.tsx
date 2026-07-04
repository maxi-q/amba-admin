import { Link, Outlet, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageLoader } from "@senler/ui";
import { usePrivateCreativeTask } from "@/hooks/creativetasks/usePrivateCreativeTask";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { PrivateCreativeTaskDetailHeader } from "./components/PrivateCreativeTaskDetailHeader";

export default function PrivateCreativeTaskDetailLayout() {
  const { slug, privateTaskId } = useParams<{
    slug: string;
    privateTaskId: string;
  }>();
  const { task, isLoading, isError, error } = usePrivateCreativeTask(privateTaskId ?? "");

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
        errorMessage={(error as Error)?.message ?? "Индивидуальная задача не найдена"}
      />
    );
  }

  return (
    <div className="w-full px-2 py-3">
      <Link
        to={`/rooms/${slug ?? ""}/creativetasks/private`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        К индивидуальным задачам
      </Link>

      <PrivateCreativeTaskDetailHeader />

      <Outlet context={{ task }} />
    </div>
  );
}
