import { Alert, Link } from "@mui/material";

interface RoomsEmptyStateProps {
  onCreateClick: () => void;
}

export const RoomsEmptyState = ({ onCreateClick }: RoomsEmptyStateProps) => {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      Нет созданных комнат.{' '}
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
        Создайте первую комнату
      </Link>
      .
    </Alert>
  );
};

