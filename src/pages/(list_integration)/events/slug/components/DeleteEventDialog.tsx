import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteEventDialogProps {
  open: boolean;
  eventName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteEventDialog = ({
  open,
  eventName,
  onConfirm,
  onCancel,
}: DeleteEventDialogProps) => {
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
          Вы уверены, что хотите удалить событие "{eventName}"? Это действие нельзя будет отменить.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Отмена
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

