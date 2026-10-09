import { useMemo } from "react";
import { toast } from "sonner";
import type { CreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { useUpdateCreativeTask } from "@/hooks/creativetasks/useUpdateCreativeTask";
import { useSprints } from "@/hooks/sprints/useSprints";
import { SprintCreationTaskDialog } from "../../sprints/slug/components/SprintCreationTaskDialog";
import {
  creativeTaskToDraft,
  draftTaskToUpdatePayload,
} from "../../sprints/slug/components/draftSprintTask";

interface EditCreativeTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: CreativeTaskWithDefaultsDto | null;
  roomSlug: string;
  onSuccess?: () => void;
}

export function EditCreativeTaskDialog({
  open,
  onClose,
  task,
  roomSlug,
  onSuccess,
}: EditCreativeTaskDialogProps) {
  const update = useUpdateCreativeTask();
  const sprintsQuery = useSprints(
    { page: 1, size: 100 },
    roomSlug,
    { allPages: true },
  );
  const initialTask = useMemo(
    () => (task ? creativeTaskToDraft(task) : null),
    [task],
  );
  const sprint = sprintsQuery.sprints.find((item) => item.id === task?.sprintId);
  const validationMessages = Object.values(update.validationErrors).flat();
  const errorMessage = validationMessages.length
    ? validationMessages.join(". ")
    : update.error?.message;

  if (!task || !initialTask) return null;

  return (
    <SprintCreationTaskDialog
      open={open}
      roomId={task.roomId}
      roomSlug={roomSlug}
      initialTask={initialTask}
      lockedSprintName={sprint?.name?.trim() || "Текущий спринт"}
      saveLabel="Сохранить"
      isSaving={update.isPending}
      serverError={errorMessage}
      onClose={onClose}
      onSave={(form) => {
        update.updateCreativeTask(
          {
            id: task.id,
            data: draftTaskToUpdatePayload(form, task.sprintId),
          },
          {
            onSuccess: () => {
              toast.success("Задание сохранено");
              onClose();
              onSuccess?.();
            },
          },
        );
      }}
    />
  );
}
