import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";

interface SubmissionRejectDialogProps {
  open: boolean;
  submission: ISubmission | null;
  onClose: () => void;
  onConfirm: (params: { reviewComment: string }) => void;
  isPending: boolean;
}

export function SubmissionRejectDialog({
  open,
  submission,
  onClose,
  onConfirm,
  isPending,
}: SubmissionRejectDialogProps) {
  const [reviewComment, setReviewComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReviewComment("");
      setError("");
    }
  }, [open, submission?.id]);

  const handleConfirm = () => {
    const trimmed = reviewComment.trim();
    if (!trimmed) {
      setError("Комментарий обязателен при отклонении");
      return;
    }
    setError("");
    onConfirm({ reviewComment: trimmed });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Отклонить ответ</DialogTitle>
      <DialogContent>
        <TextField
          label="Комментарий (reviewComment)"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          fullWidth
          required
          multiline
          rows={3}
          error={!!error}
          helperText={error}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={isPending || !reviewComment.trim()}
        >
          {isPending ? "Сохранение…" : "Отклонить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
