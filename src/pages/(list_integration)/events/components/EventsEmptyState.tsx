import { Alert } from "@mui/material";

/**
 * Компонент для отображения пустого состояния списка событий
 * Показывается, когда события не найдены
 */
export const EventsEmptyState = () => {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      События не найдены. Создайте первое событие для этой комнаты.
    </Alert>
  );
};

