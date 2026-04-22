import { useNavigate, useParams } from "react-router-dom";
import { useSprints } from "@/hooks/sprints/useSprints";
import { PageLoader } from "@senler/ui";
import { SprintsErrorState } from "./components/SprintsErrorState";
import { SprintsEmptyState } from "./components/SprintsEmptyState";
import { SprintCard } from "./components/SprintCard";
import { CreateSprintButton } from "./components/CreateSprintButton";

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
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError) {
    return <SprintsErrorState errorMessage={error?.message} />;
  }

  const activeSprints = sprints.filter((sprint) => !sprint.isDeleted);

  return (
    <div className="w-full px-2 pb-6">
      <div className="flex flex-col gap-2">
        {activeSprints.length === 0 ? (
          <SprintsEmptyState onCreateClick={handleCreateSprint} />
        ) : (
          activeSprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))
        )}

        <CreateSprintButton onClick={handleCreateSprint} />
      </div>
    </div>
  );
}
