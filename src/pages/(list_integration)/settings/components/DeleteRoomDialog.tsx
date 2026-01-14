import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { PRIMARY_COLOR } from "@/constants/colors";

interface DeleteRoomDialogProps {
  open: boolean;
  roomName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export const DeleteRoomDialog = ({
  open,
  roomName,
  onConfirm,
  onCancel,
  isUpdating,
}: DeleteRoomDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Подтверждение удаления
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Вы уверены, что хотите удалить комнату "{roomName}"? Это действие нельзя будет отменить.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isUpdating} sx={{ color: PRIMARY_COLOR }}>
          Отмена
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus disabled={isUpdating}>
          {isUpdating ? 'Удаление...' : 'Удалить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

