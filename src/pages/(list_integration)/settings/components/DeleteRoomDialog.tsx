import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@senler/ui";

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
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить комнату «{roomName}»? Это
            действие нельзя будет отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            disabled={isUpdating}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {isUpdating ? "Удаление…" : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
