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

interface DeleteOrdRoomFileDialogProps {
  open: boolean;
  fileName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteOrdRoomFileDialog({
  open,
  fileName,
  isPending,
  onConfirm,
  onCancel,
}: DeleteOrdRoomFileDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить ORD-файл?</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Файл «{fileName}» будет скрыт из списка. Медиа в хранилище и ВК ОРД сохранятся.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={onCancel}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? "Удаление…" : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
