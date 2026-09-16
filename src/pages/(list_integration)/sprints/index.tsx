import { useNavigate, useParams } from "react-router-dom";
import { useSprints } from "@/hooks/sprints/useSprints";
import { PageLoader } from "@senler/ui";
import { SprintsErrorState } from "./components/SprintsErrorState";
import { SprintsEmptyState } from "./components/SprintsEmptyState";
import { SprintsPageToolbar } from "./components/SprintsPageToolbar";
import { SprintCard } from "./components/SprintCard";

export default function SprintList() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { sprints, isLoading, isError, error } = useSprints(
    { page: 1, size: 100, include: "tasksToReviewCount" },
    slug || ""
  );

  const handleCreateSprint = () => {
    navigate(`/rooms/${slug}/sprints/new`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError) {
    return <SprintsErrorState errorMessage={error?.message} />;
  }

  if (sprints.length === 0) {
    return (
      <div className="-m-4 flex min-h-dvh w-[calc(100%+2rem)] min-w-0 flex-col bg-white md:-m-6 md:w-[calc(100%+3rem)]">
        <SprintsPageToolbar onCreateClick={handleCreateSprint} />
        <SprintsEmptyState onCreateClick={handleCreateSprint} />
      </div>
    );
  }

  return (
    <div className="-m-4 flex min-h-dvh w-[calc(100%+2rem)] min-w-0 flex-col bg-white md:-m-6 md:w-[calc(100%+3rem)]">
      <SprintsPageToolbar onCreateClick={handleCreateSprint} />
      <div className="flex flex-col">
        {sprints.map((sprint) => (
          <SprintCard key={sprint.id} sprint={sprint} />
        ))}
      </div>
    </div>
  );
}
