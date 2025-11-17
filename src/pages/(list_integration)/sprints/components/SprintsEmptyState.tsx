import { Alert, Link } from "@mui/material";

interface SprintsEmptyStateProps {
  onCreateClick: () => void;
}

export const SprintsEmptyState = ({ onCreateClick }: SprintsEmptyStateProps) => {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      Спринтов пока нет.{' '}
      <Link
        component="button"
        onClick={onCreateClick}
        sx={{
          textDecoration: 'underline',
          cursor: 'pointer',
          color: 'inherit',
          border: 'none',
          background: 'none',
          padding: 0,
          font: 'inherit',
        }}
      >
        Создайте первый спринт
      </Link>
      , чтобы начать работу.
    </Alert>
  );
};

