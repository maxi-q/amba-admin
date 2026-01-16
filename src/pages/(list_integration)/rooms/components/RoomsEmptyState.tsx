import { Alert, Link } from "@mui/material";
import { PRIMARY_COLOR } from "@/constants/colors";

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
          color: PRIMARY_COLOR,
          border: 'none',
          background: 'none',
          padding: 0,
          font: 'inherit',
          fontWeight: 500
        }}
      >
        Создайте первую комнату
      </Link>
      .
    </Alert>
  );
};

