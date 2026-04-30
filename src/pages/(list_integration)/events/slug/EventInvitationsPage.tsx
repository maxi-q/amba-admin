import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, Button, InputField, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useEvents } from "@/hooks/events/useEvents";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useRoomInvitations } from "@/hooks/invitations/useRoomInvitations";
import { useDeleteInvitation } from "@/hooks/invitations/useDeleteInvitation";
import { useCreateInvitation } from "@/hooks/invitations/useCreateInvitation";
import { getFirstFieldError } from "@services/config/axios.helper";
import { InvitationCard } from "../../invitations/components/InvitationCard";
import { DeleteInvitationDialog } from "../../invitations/components/DeleteInvitationDialog";
import { EventNotFoundState } from "./components/EventNotFoundState";
import {
  INVITATION_CHANNEL_TYPE_VK,
  type IInvitation,
} from "@services/invitations/invitations.types";
import { resolveVkProfileId } from "@/utils/vkProfile";

/**
 * Подпункт «Приглашения в событие»: отфильтрованный по текущему событию список
 * приглашений и форма создания/редактирования с автоматически выбранным событием.
 */
const EventInvitationsPage = () => {
  const { slug, eventId } = useParams<{ slug: string; eventId: string }>();
  const [deletingInvitation, setDeletingInvitation] = useState<IInvitation | null>(null);
  const [vkProfileUrl, setVkProfileUrl] = useState("");
  const [vkInvitationError, setVkInvitationError] = useState("");
  const [isResolvingVk, setIsResolvingVk] = useState(false);

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
  } = useGetRoomById(slug ?? "");

  const roomId = room?.id ?? "";

  const { events, isLoading: isLoadingEvents } = useEvents(
    { page: 1, size: 100 },
    slug ?? ""
  );

  const event = useMemo(
    () => events.find((e) => e.id === eventId) ?? null,
    [events, eventId]
  );

  const { tasks } = useRoomCreativeTasks(roomId, { page: 1, size: 100 });

  const { invitations, isLoading, isError, error } = useRoomInvitations(roomId);

  const {
    deleteInvitation,
    isPending: isDeletePending,
    generalError: deleteError,
    reset: resetDelete,
  } = useDeleteInvitation();

  const {
    createInvitation,
    isPending: isCreatingInvitation,
    generalError: createInvitationError,
    validationErrors: createInvitationValidationErrors,
    reset: resetCreateInvitation,
  } = useCreateInvitation();

  const filteredInvitations = useMemo(() => {
    if (!eventId) return [];
    return invitations
      .filter((inv) => inv.eventIds?.includes(eventId))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [invitations, eventId]);

  const resolveTaskLabel = useCallback(
    (id: string) => {
      const t = tasks.find((x) => x.id === id);
      return t ? t.title : id;
    },
    [tasks]
  );

  const resolveEventLabel = useCallback(
    (id: string) => {
      const e = events.find((x) => x.id === id);
      return e ? e.name : id;
    },
    [events]
  );

  const invitationTargetError =
    getFirstFieldError(createInvitationValidationErrors, "targets") ||
    getFirstFieldError(createInvitationValidationErrors, "subscriberId");
  const invitationError =
    vkInvitationError || createInvitationError || invitationTargetError;
  const isInvitationPending = isResolvingVk || isCreatingInvitation;

  const handleCreateInvitation = async () => {
    if (!roomId || !eventId || !vkProfileUrl.trim()) return;

    setVkInvitationError("");
    setIsResolvingVk(true);

    try {
      const subscriberId = await resolveVkProfileId(vkProfileUrl);

      createInvitation(
        {
          roomId,
          targets: [
            {
              channelTypeId: INVITATION_CHANNEL_TYPE_VK,
              subscriberId,
            },
          ],
          taskIds: [],
          eventIds: [eventId],
        },
        {
          onSuccess: () => {
            setVkProfileUrl("");
            resetCreateInvitation();
          },
        }
      );
    } catch (error) {
      setVkInvitationError(
        error instanceof Error
          ? error.message
          : "Не удалось получить id профиля VK."
      );
    } finally {
      setIsResolvingVk(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingInvitation || !roomId) return;
    deleteInvitation(
      { id: deletingInvitation.id, roomId },
      {
        onSuccess: () => {
          setDeletingInvitation(null);
          resetDelete();
        },
      }
    );
  };

  if (isLoadingRoom || isLoadingEvents) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <div className="w-full px-2 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {(roomError as Error)?.message ?? "Комната не найдена"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!event || !eventId) {
    return <EventNotFoundState />;
  }

  return (
    <div className="w-full px-2 py-6">
      <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">
        Приглашения в событие
      </h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Подписчики ВК (id в ВК), которые будут приглашены в событие «{event.name}» после
          регистрации.
        </p>
      </div>

      <div className="mb-4 grid max-w-xl gap-2 rounded-md border border-border p-3">
        <p className="text-sm font-medium text-foreground">
          Создать приглашение после регистрации
        </p>
        <p className="text-sm text-muted-foreground">
          Отдельного роута для добавления уже зарегистрированного амбассадора в событие по
          промокоду в frontend не найдено, поэтому здесь используется только /invitations.
          Вставьте ссылку на профиль VK, событие подставится автоматически.
        </p>
        <InputField
          className="w-full min-w-0"
          value={vkProfileUrl}
          onChange={(e) => {
            setVkProfileUrl(e.target.value);
            setVkInvitationError("");
          }}
          error={!!invitationError}
          helperText={invitationError || "Например: https://vk.com/incredibly_bad"}
          placeholder="https://vk.com/incredibly_bad"
          aria-label="Ссылка на профиль VK"
        />
        <Button
          type="button"
          size="lg"
          className="h-10 w-full"
          onClick={() => void handleCreateInvitation()}
          disabled={isInvitationPending || !vkProfileUrl.trim() || !roomId}
        >
          {isInvitationPending ? "Создание…" : "Создать приглашение"}
        </Button>
      </div>

      {isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {(error as Error)?.message ?? "Не удалось загрузить приглашения"}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <PageLoader label="Загрузка приглашений…" />
        </div>
      ) : filteredInvitations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока нет приглашений в это событие. Создайте запись с subscriberId ВК.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredInvitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
              resolveTaskLabel={resolveTaskLabel}
              resolveEventLabel={resolveEventLabel}
              onDelete={setDeletingInvitation}
            />
          ))}
        </div>
      )}

      <DeleteInvitationDialog
        open={!!deletingInvitation}
        invitation={deletingInvitation}
        onClose={() => {
          setDeletingInvitation(null);
          resetDelete();
        }}
        onConfirm={handleConfirmDelete}
        isPending={isDeletePending}
        errorMessage={deleteError}
      />
    </div>
  );
};

export default EventInvitationsPage;
