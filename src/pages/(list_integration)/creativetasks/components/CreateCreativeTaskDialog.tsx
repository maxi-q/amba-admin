import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert
} from "@mui/material";
import { useCreateCreativeTask } from "@/hooks/creativetasks/useCreateCreativeTask";
import type { ICreateCreativeTaskRequest } from "@services/creativetasks/creativetasks.types";
import { PRIMARY_COLOR } from "@/constants/colors";

/** Преобразует локальную datetime строку в ISO */
function toISOString(localDateTime: string): string {
  if (!localDateTime) return "";
  return new Date(localDateTime).toISOString();
}

interface CreateCreativeTaskDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  onSuccess?: () => void;
}

export function CreateCreativeTaskDialog({
  open,
  onClose,
  roomId,
  onSuccess
}: CreateCreativeTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const {
    createCreativeTask,
    isPending,
    isSuccess,
    generalError,
    validationErrors
  } = useCreateCreativeTask();

  useEffect(() => {
    if (isSuccess) {
      setTitle("");
      setDescription("");
      setStartsAt("");
      setEndsAt("");
      onClose();
      onSuccess?.();
    }
  }, [isSuccess, onClose, onSuccess]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setStartsAt("");
      setEndsAt("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!roomId) return;
    const payload: ICreateCreativeTaskRequest = {
      title: title.trim(),
      description: description.trim(),
      startsAt: toISOString(startsAt),
      endsAt: toISOString(endsAt),
      roomId
    };
    createCreativeTask(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать креативную задачу</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {generalError && (
            <Alert severity="error">{generalError}</Alert>
          )}
          <TextField
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
            error={!!validationErrors?.title?.length}
            helperText={validationErrors?.title?.[0]}
            required
          />
          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={3}
            error={!!validationErrors?.description?.length}
            helperText={validationErrors?.description?.[0]}
          />
          <TextField
            label="Дата начала"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors?.startsAt?.length}
            helperText={validationErrors?.startsAt?.[0]}
          />
          <TextField
            label="Дата окончания"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors?.endsAt?.length}
            helperText={validationErrors?.endsAt?.[0]}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || !title.trim()}
          sx={{
            backgroundColor: PRIMARY_COLOR,
            "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 }
          }}
        >
          {isPending ? "Создание…" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
