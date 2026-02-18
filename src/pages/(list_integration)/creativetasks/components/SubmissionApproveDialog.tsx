import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { PRIMARY_COLOR } from "@/constants/colors";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";

interface SubmissionApproveDialogProps {
  open: boolean;
  submission: ISubmission | null;
  onClose: () => void;
  onConfirm: (params: { rewardValue: number }) => void;
  isPending: boolean;
}

export function SubmissionApproveDialog({
  open,
  submission,
  onClose,
  onConfirm,
  isPending,
}: SubmissionApproveDialogProps) {
  const [rewardValue, setRewardValue] = useState<number>(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRewardValue(0);
      setError("");
    }
  }, [open, submission?.id]);

  const handleConfirm = () => {
    if (rewardValue < 0) {
      setError("Значение награды не может быть отрицательным");
      return;
    }
    setError("");
    onConfirm({ rewardValue });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Одобрить ответ</DialogTitle>
      <DialogContent>
        {submission && (
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Награда (rewardValue)"
              type="number"
              value={rewardValue === 0 ? "" : rewardValue}
              onChange={(e) => {
                const v = e.target.value;
                setRewardValue(v === "" ? 0 : Math.max(0, Number(v)));
              }}
              inputProps={{ min: 0, step: 1 }}
              fullWidth
              required
              error={!!error}
              helperText={error}
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isPending}
          sx={{
            backgroundColor: PRIMARY_COLOR,
            "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
          }}
        >
          {isPending ? "Сохранение…" : "Одобрить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
