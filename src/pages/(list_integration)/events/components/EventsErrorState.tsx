import { Box, Alert, Button } from "@mui/material";

interface EventsErrorStateProps {
  /** Сообщение об ошибке */
  errorMessage?: string;
}

/**
 * Компонент для отображения состояния ошибки при загрузке событий
 * Показывает сообщение об ошибке и кнопку для повторной попытки
 */
export const EventsErrorState = ({ errorMessage }: EventsErrorStateProps) => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        Ошибка при загрузке событий: {errorMessage || 'Неизвестная ошибка'}
      </Alert>
      <Button
        variant="outlined"
        onClick={() => window.location.reload()}
      >
        Попробовать снова
      </Button>
    </Box>
  );
};

