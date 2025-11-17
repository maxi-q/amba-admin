import { Box, Button } from "@mui/material";

interface RoomActionButtonsProps {
  onSave: () => void;
  onDelete: () => void;
  isUpdating: boolean;
}

export const RoomActionButtons = ({ onSave, onDelete, isUpdating }: RoomActionButtonsProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, my: 4 }}>
      <Button
        variant="outlined"
        color="error"
        onClick={onDelete}
        disabled={isUpdating}
        sx={{ minWidth: 120 }}
      >
        Удалить
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        disabled={isUpdating}
        sx={{ minWidth: 120 }}
      >
        {isUpdating ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </Box>
  );
};

