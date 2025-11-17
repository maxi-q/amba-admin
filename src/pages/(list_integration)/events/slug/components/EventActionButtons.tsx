import { Box, Button } from "@mui/material";

interface EventActionButtonsProps {
  isNewEvent: boolean;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isCheckingPrefix: boolean;
}

export const EventActionButtons = ({
  isNewEvent,
  onSave,
  onDelete,
  isCreating,
  isUpdating,
  isCheckingPrefix,
}: EventActionButtonsProps) => {
  const isLoading = isCreating || isUpdating || isCheckingPrefix;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      {!isNewEvent && (
        <Button
          variant="outlined"
          color="error"
          onClick={onDelete}
          sx={{ minWidth: 120 }}
          disabled={isUpdating}
        >
          Удалить
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        sx={{ minWidth: 120 }}
        disabled={isLoading}
      >
        {isLoading
          ? 'Сохранение...'
          : (isNewEvent ? 'Добавить' : 'Сохранить')
        }
      </Button>
    </Box>
  );
};

