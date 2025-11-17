import { Box, Button } from "@mui/material";

interface SprintActionButtonsProps {
  isNewSprint: boolean;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export const SprintActionButtons = ({
  isNewSprint,
  onSave,
  onDelete,
  isCreating,
  isUpdating,
}: SprintActionButtonsProps) => {
  const isLoading = isCreating || isUpdating;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
      {!isNewSprint && (
        <Button
          variant="outlined"
          color="error"
          onClick={onDelete}
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          Удалить
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        disabled={isLoading}
        sx={{ minWidth: 120 }}
      >
        {isLoading
          ? (isNewSprint ? 'Создание...' : 'Сохранение...')
          : (isNewSprint ? 'Добавить' : 'Сохранить')
        }
      </Button>
    </Box>
  );
};

