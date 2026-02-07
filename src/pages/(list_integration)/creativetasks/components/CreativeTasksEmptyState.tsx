import { Alert, Link } from "@mui/material";

interface CreativeTasksEmptyStateProps {
  onCreateClick: () => void;
}

export function CreativeTasksEmptyState({ onCreateClick }: CreativeTasksEmptyStateProps) {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      Креативных задач пока нет.{" "}
      <Link
        component="button"
        onClick={onCreateClick}
        sx={{
          textDecoration: "underline",
          cursor: "pointer",
          color: "inherit",
          border: "none",
          background: "none",
          padding: 0,
          font: "inherit"
        }}
      >
        Создайте первую задачу
      </Link>
      , чтобы начать.
    </Alert>
  );
}
