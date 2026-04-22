import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@senler/ui";
import type { IInvitation } from "@services/invitations/invitations.types";

interface DeleteInvitationDialogProps {
  open: boolean;
  invitation: IInvitation | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  errorMessage: string;
}

export function DeleteInvitationDialog({
  open,
  invitation,
  onClose,
  onConfirm,
  isPending,
  errorMessage,
}: DeleteInvitationDialogProps) {
  const preview =
    invitation?.targets
      ?.map((t) => t.subscriberId)
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") ?? "";

  const more = (invitation?.targets?.length ?? 0) > 3;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить приглашение?</AlertDialogTitle>
          {errorMessage ? (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogDescription className="text-left">
            Будет удалена запись приглашения
            {preview ? (
              <>
                {" "}
                (ВК:{" "}
                <span className="font-mono text-foreground">{preview}</span>
                {more ? "…" : ""}
                )
              </>
            ) : null}
            . Действие необратимо.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {isPending ? "Удаление…" : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
