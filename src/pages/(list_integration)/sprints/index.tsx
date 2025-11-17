import { useNavigate, useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { useSprints } from "@/hooks/sprints/useSprints";
import { Loader } from "@/components/Loader";
import { SprintsHeader } from "./components/SprintsHeader";
import { SprintsErrorState } from "./components/SprintsErrorState";
import { SprintsEmptyState } from "./components/SprintsEmptyState";
import { SprintCard } from "./components/SprintCard";
import { CreateSprintButton } from "./components/CreateSprintButton";

export default function SprintList() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    sprints,
    isLoading,
    isError,
    error
  } = useSprints(
    { page: 1, size: 100 },
    slug || ''
  );

  const handleCreateSprint = () => {
    navigate(`/rooms/${slug}/sprints/new`);
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  if (isError) {
    return <SprintsErrorState errorMessage={error?.message} />;
  }

  const activeSprints = sprints.filter((sprint) => !sprint.isDeleted);

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <SprintsHeader infoLink="info" />

      <Stack spacing={2}>
        {activeSprints.length === 0 ? (
          <SprintsEmptyState onCreateClick={handleCreateSprint} />
        ) : (
          activeSprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))
        )}

        <CreateSprintButton onClick={handleCreateSprint} />
      </Stack>
    </Box>
  );
}
