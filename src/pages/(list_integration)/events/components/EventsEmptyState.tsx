import { Alert, Link } from "@mui/material";

interface EventsEmptyStateProps {
  onCreateClick: () => void;
}

export const EventsEmptyState = ({ onCreateClick }: EventsEmptyStateProps) => {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      События не найдены.{' '}
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
        Создайте первое событие
      </Link>
      {' '}для этой комнаты.
    </Alert>
  );
};

