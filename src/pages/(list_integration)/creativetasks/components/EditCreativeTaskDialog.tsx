import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { useUpdateCreativeTask } from "@/hooks/creativetasks/useUpdateCreativeTask";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import type { ICreativeTask, IUpdateCreativeTaskRequest } from "@services/creativetasks/creativetasks.types";
import { PRIMARY_COLOR } from "@/constants/colors";

/** ISO datetime в значение для input datetime-local */
function toLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

/** Локальная datetime строка в ISO */
function toISOString(localDateTime: string): string {
  if (!localDateTime) return "";
  return new Date(localDateTime).toISOString();
}

interface EditCreativeTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: ICreativeTask | null;
  onSuccess?: () => void;
}

export function EditCreativeTaskDialog({
  open,
  onClose,
  task,
  onSuccess
}: EditCreativeTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);

  const { task: currentTask, isLoading: isLoadingTask } = useCreativeTask(task?.id ?? "");
  const {
    updateCreativeTask,
    isPending,
    isSuccess,
    generalError,
    validationErrors
  } = useUpdateCreativeTask();

  const data = currentTask ?? task;

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      setStartsAt(toLocalDateTime(data.startsAt));
      setEndsAt(toLocalDateTime(data.endsAt));
      setIsDeleted(data.isDeleted);
    }
  }, [data, open]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
      onSuccess?.();
    }
  }, [isSuccess, onClose, onSuccess]);

  const handleSubmit = () => {
    if (!task?.id) return;
    const payload: IUpdateCreativeTaskRequest = {
      title: title.trim(),
      description: description.trim(),
      startsAt: toISOString(startsAt),
      endsAt: toISOString(endsAt),
      isDeleted
    };
    updateCreativeTask({ id: task.id, data: payload });
  };

  const loading = open && (isLoadingTask || !data);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать задачу</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" py={3}>
            Загрузка…
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            {generalError && <Alert severity="error">{generalError}</Alert>}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDeleted}
                  onChange={(e) => setIsDeleted(e.target.checked)}
                  color="primary"
                />
              }
              label="Удалена (скрыта)"
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || loading || !title.trim()}
          sx={{
            backgroundColor: PRIMARY_COLOR,
            "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 }
          }}
        >
          {isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
