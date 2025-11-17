import { Box, Button } from "@mui/material";

interface CreateEventButtonProps {
  /** Обработчик клика для создания нового события */
  onClick: () => void;
}

/**
 * Кнопка для создания нового события
 * Отображается внизу списка событий
 */
export const CreateEventButton = ({ onClick }: CreateEventButtonProps) => {
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        variant="outlined"
        sx={{
          bgcolor: 'success.50',
          borderColor: 'success.200',
          color: 'success.700',
          '&:hover': {
            bgcolor: 'success.100',
            borderColor: 'success.300',
          },
        }}
        onClick={onClick}
      >
        Добавить событие
      </Button>
    </Box>
  );
};

