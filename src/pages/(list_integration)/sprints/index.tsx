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
    { page: 1, size: 100 },
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

  const activeSprints = sprints.filter((sprint) => !sprint.isDeleted);

  if (activeSprints.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-2rem)] min-w-0 flex-col bg-white">
        <SprintsPageToolbar onCreateClick={handleCreateSprint} />
        <SprintsEmptyState onCreateClick={handleCreateSprint} />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col bg-white pb-6">
      <SprintsPageToolbar onCreateClick={handleCreateSprint} />
      <div className="flex flex-col">
        {activeSprints.map((sprint) => (
          <SprintCard key={sprint.id} sprint={sprint} />
        ))}
      </div>
    </div>
  );
}
