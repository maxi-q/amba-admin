import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteSprintDialogProps {
  open: boolean;
  sprintName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export const DeleteSprintDialog = ({
  open,
  sprintName,
  onConfirm,
  onCancel,
  isUpdating,
}: DeleteSprintDialogProps) => {
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
          Вы уверены, что хотите удалить спринт "{sprintName}"? Это действие нельзя будет отменить.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary" disabled={isUpdating}>
          Отмена
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus disabled={isUpdating}>
          {isUpdating ? 'Удаление...' : 'Удалить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

