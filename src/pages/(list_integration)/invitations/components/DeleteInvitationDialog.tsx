import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from "@mui/material";
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Удалить приглашение?</DialogTitle>
      <DialogContent>
        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            {errorMessage}
          </Alert>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          Будет удалена запись приглашения
          {preview ? (
            <>
              {" "}
              (ВК:{" "}
              <Typography component="span" variant="body2" sx={{ fontFamily: "monospace" }}>
                {preview}
                {(invitation?.targets?.length ?? 0) > 3 ? "…" : ""}
              </Typography>
              )
            </>
          ) : null}
          . Действие необратимо.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Удаление…" : "Удалить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
