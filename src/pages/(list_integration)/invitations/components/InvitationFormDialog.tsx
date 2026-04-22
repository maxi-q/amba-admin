import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import { getFirstFieldError } from "@services/config/axios.helper";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useEvents } from "@/hooks/events/useEvents";
import { useCreateInvitation } from "@/hooks/invitations/useCreateInvitation";
import { useUpdateInvitation } from "@/hooks/invitations/useUpdateInvitation";
import { INVITATION_CHANNEL_TYPE_VK, type IInvitation } from "@services/invitations/invitations.types";

const SUBSCRIBER_TEXTAREA_CLASS =
  "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
  const [subscriberInput, setSubscriberInput] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  const { tasks } = useRoomCreativeTasks(roomId, { page: 1, size: 100 });
  const { events } = useEvents({ page: 1, size: 100 }, slug);

  const {
    createInvitation,
    isPending: isCreatePending,
    reset: resetCreate,
    generalError: createGeneralError,
    validationErrors: createValidationErrors,
  } = useCreateInvitation();

  const {
    updateInvitation,
    isPending: isUpdatePending,
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
    if (!open) return;
    if (mode === "create") {
      setSubscriberInput("");
      setSelectedTaskIds([]);
      setSelectedEventIds([]);
      setTaskSearch("");
      setEventSearch("");
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open || mode !== "edit" || !invitation) return;
    const subs = (invitation.targets ?? []).map((t) => t.subscriberId).filter(Boolean);
    setSubscriberInput(subs.join("\n"));
    setSelectedTaskIds([...(invitation.taskIds ?? [])]);
    setSelectedEventIds([...(invitation.eventIds ?? [])]);
    setTaskSearch("");
    setEventSearch("");
  }, [open, mode, invitation]);

  const isPending = mode === "create" ? isCreatePending : isUpdatePending;
  const generalError = mode === "create" ? createGeneralError : updateGeneralError;
  const validationErrors =
    mode === "create" ? createValidationErrors : updateValidationErrors;

  const subscriberLines = useMemo(
    () =>
      subscriberInput
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [subscriberInput]
  );

  const targetsPayload = useMemo(
    () => subscriberIdsToTargets(subscriberLines),
    [subscriberLines]
  );

  const canSubmit = targetsPayload.length > 0;

  const filteredTasks = useMemo(() => {
    const q = taskSearch.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, taskSearch]);

  const filteredEvents = useMemo(() => {
    const q = eventSearch.toLowerCase().trim();
    if (!q) return events;
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, eventSearch]);

  const toggleTaskId = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleEventId = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const targetErrMsg =
    getFirstFieldError(validationErrors, "targets") ||
    getFirstFieldError(validationErrors, "subscriberId");
  const targetHint =
    "По одному ID на строку; можно вставить список из нескольких строк.";

  const handleSubmit = () => {
    const taskIds = selectedTaskIds;
    const eventIds = selectedEventIds;

    if (mode === "create") {
      createInvitation(
        {
          roomId,
          targets: targetsPayload,
          taskIds,
          eventIds,
        },
        {
          onSuccess: () => {
            onClose();
            resetCreate();
          },
        }
      );
      return;
    }
    if (invitation) {
      updateInvitation(
        {
          id: invitation.id,
          roomId,
          data: { targets: targetsPayload, taskIds, eventIds },
        },
        {
          onSuccess: () => {
            onClose();
            resetUpdate();
          },
        }
      );
    }
  };

  const title = mode === "create" ? "Создать приглашение" : "Изменить приглашение";

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex !h-[100dvh] !max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0"
      >
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-6">
          {generalError ? (
            <Alert variant="destructive">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">ID подписчиков ВК *</p>
            <textarea
              className={SUBSCRIBER_TEXTAREA_CLASS}
              value={subscriberInput}
              onChange={(e) => setSubscriberInput(e.target.value)}
              placeholder="Введите ID, по одному на строку"
              aria-label="ID подписчиков ВК"
              aria-invalid={!!targetErrMsg}
            />
            {targetErrMsg ? (
              <p className="text-sm text-destructive">{targetErrMsg}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{targetHint}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Креативные задачи</p>
            <InputField
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Поиск по названию"
              aria-label="Поиск креативных задач"
            />
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {filteredTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет задач</p>
              ) : (
                filteredTasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/60"
                  >
                    <input
                      type="checkbox"
                      className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleTaskId(task.id)}
                    />
                    <span className="min-w-0 leading-snug">{task.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">События</p>
            <InputField
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Поиск по названию"
              aria-label="Поиск событий"
            />
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {filteredEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет событий</p>
              ) : (
                filteredEvents.map((ev) => (
                  <label
                    key={ev.id}
                    className="flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/60"
                  >
                    <input
                      type="checkbox"
                      className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      checked={selectedEventIds.includes(ev.id)}
                      onChange={() => toggleEventId(ev.id)}
                    />
                    <span className="min-w-0 leading-snug">{ev.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>
            Отмена
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
          >
            {isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
