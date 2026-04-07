import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Autocomplete,
} from "@mui/material";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useEvents } from "@/hooks/events/useEvents";
import { useCreateInvitation } from "@/hooks/invitations/useCreateInvitation";
import { useUpdateInvitation } from "@/hooks/invitations/useUpdateInvitation";
import { INVITATION_CHANNEL_TYPE_VK, type IInvitation } from "@services/invitations/invitations.types";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import type { IEvent } from "@services/events/events.types";
import { PRIMARY_COLOR } from "@/constants/colors";

function subscriberIdsToTargets(ids: string[]): { channelTypeId: number; subscriberId: string }[] {
  return ids
    .map((s) => s.trim())
    .filter(Boolean)
    .map((subscriberId) => ({ channelTypeId: INVITATION_CHANNEL_TYPE_VK, subscriberId }));
}

interface InvitationFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  roomId: string;
  slug: string;
  invitation: IInvitation | null;
}

export function InvitationFormDialog({
  open,
  onClose,
  mode,
  roomId,
  slug,
  invitation,
}: InvitationFormDialogProps) {
  const [subscriberIds, setSubscriberIds] = useState<string[]>([]);

  const [selectedTasks, setSelectedTasks] = useState<ICreativeTask[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<IEvent[]>([]);

  const { tasks } = useRoomCreativeTasks(roomId, { page: 1, size: 100 });
  const { events } = useEvents({ page: 1, size: 100 }, slug);

  const {
    createInvitation,
    isPending: isCreatePending,
    isSuccess: isCreateSuccess,
    reset: resetCreate,
    generalError: createGeneralError,
    validationErrors: createValidationErrors,
  } = useCreateInvitation();

  const {
    updateInvitation,
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    reset: resetUpdate,
    generalError: updateGeneralError,
    validationErrors: updateValidationErrors,
  } = useUpdateInvitation();

  useEffect(() => {
    if (open) {
      resetCreate();
      resetUpdate();
    }
  }, [open, resetCreate, resetUpdate]);

  useEffect(() => {
    if (open && mode === "create") {
      setSubscriberIds([]);
      setSelectedTasks([]);
      setSelectedEvents([]);
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open || mode !== "edit" || !invitation) return;
    const subs = (invitation.targets ?? []).map((t) => t.subscriberId).filter(Boolean);
    setSubscriberIds(subs);
    const tk = invitation.taskIds ?? [];
    const ev = invitation.eventIds ?? [];
    setSelectedTasks(tasks.filter((x) => tk.includes(x.id)));
    setSelectedEvents(events.filter((e) => ev.includes(e.id)));
  }, [open, mode, invitation, tasks, events]);

  useEffect(() => {
    if (!open) return;
    if (mode === "create" && isCreateSuccess) {
      onClose();
      resetCreate();
    }
  }, [open, mode, isCreateSuccess, onClose, resetCreate]);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && isUpdateSuccess) {
      onClose();
      resetUpdate();
    }
  }, [open, mode, isUpdateSuccess, onClose, resetUpdate]);

  const isPending = mode === "create" ? isCreatePending : isUpdatePending;
  const generalError = mode === "create" ? createGeneralError : updateGeneralError;
  const validationErrors = mode === "create" ? createValidationErrors : updateValidationErrors;

  const targetsPayload = subscriberIdsToTargets(subscriberIds);
  const canSubmit = targetsPayload.length > 0;

  const handleSubmit = () => {
    const taskIds = selectedTasks.map((t) => t.id);
    const eventIds = selectedEvents.map((e) => e.id);

    if (mode === "create") {
      createInvitation({
        roomId,
        targets: targetsPayload,
        taskIds,
        eventIds,
      });
      return;
    }
    if (invitation) {
      updateInvitation({
        id: invitation.id,
        roomId,
        data: { targets: targetsPayload, taskIds, eventIds },
      });
    }
  };

  const title = mode === "create" ? "Создать приглашение" : "Изменить приглашение";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {generalError ? <Alert severity="error">{generalError}</Alert> : null}

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={subscriberIds}
            onChange={(_, v) => setSubscriberIds(v.map((x) => String(x).trim()).filter(Boolean))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="ID подписчиков ВК"
                size="small"
                required
                placeholder="Введите ID и нажмите Enter"
                error={!!validationErrors?.targets?.length || !!validationErrors?.subscriberId?.length}
                helperText={
                  validationErrors?.targets?.[0] ??
                  validationErrors?.subscriberId?.[0] ??
                  "Несколько значений: каждое с новой строки или через Enter в поле"
                }
              />
            )}
          />

          <Autocomplete
            multiple
            options={tasks}
            value={selectedTasks}
            onChange={(_, v) => setSelectedTasks(v)}
            getOptionLabel={(o) => o.title}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => <TextField {...params} label="Креативные задачи" size="small" />}
          />

          <Autocomplete
            multiple
            options={events}
            value={selectedEvents}
            onChange={(_, v) => setSelectedEvents(v)}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => <TextField {...params} label="События" size="small" />}
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
          disabled={isPending || !canSubmit}
          sx={{
            backgroundColor: PRIMARY_COLOR,
            "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
          }}
        >
          {isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
