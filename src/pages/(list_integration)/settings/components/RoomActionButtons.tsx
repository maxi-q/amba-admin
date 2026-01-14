import { Box, Button } from "@mui/material";
import { PRIMARY_COLOR } from "@/constants/colors";

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
        onClick={onSave}
        disabled={isUpdating}
        sx={{ 
          minWidth: 120,
          backgroundColor: PRIMARY_COLOR,
          "&:hover": {
            backgroundColor: PRIMARY_COLOR,
            opacity: 0.9
          }
        }}
      >
        {isUpdating ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </Box>
  );
};

