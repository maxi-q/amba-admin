import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, Button, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useEvents } from "@/hooks/events/useEvents";
import { useRoomInvitations } from "@/hooks/invitations/useRoomInvitations";
import { useDeleteInvitation } from "@/hooks/invitations/useDeleteInvitation";
import { InvitationsHeader } from "./components/InvitationsHeader";
import { InvitationCard } from "./components/InvitationCard";
import { InvitationFormDialog } from "./components/InvitationFormDialog";
import { DeleteInvitationDialog } from "./components/DeleteInvitationDialog";
import type { IInvitation } from "@services/invitations/invitations.types";

export default function InvitationsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingInvitation, setEditingInvitation] = useState<IInvitation | null>(null);
  const [deletingInvitation, setDeletingInvitation] = useState<IInvitation | null>(null);

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
  } = useGetRoomById(slug ?? "");

  const roomId = room?.id ?? "";

  const { tasks } = useRoomCreativeTasks(roomId, { page: 1, size: 100 });
  const { events } = useEvents({ page: 1, size: 100 }, slug ?? "");

  const { invitations, isLoading, isError, error } = useRoomInvitations(roomId);

  const {
    deleteInvitation,
    isPending: isDeletePending,
    generalError: deleteError,
    reset: resetDelete,
  } = useDeleteInvitation();

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

  const sortedInvitations = useMemo(() => {
    return [...invitations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [invitations]);

  const openCreate = () => {
    setFormMode("create");
    setEditingInvitation(null);
    setFormOpen(true);
  };

  const openEdit = (inv: IInvitation) => {
    setFormMode("edit");
    setEditingInvitation(inv);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingInvitation(null);
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

  if (isLoadingRoom) {
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

  return (
    <div className="w-full px-2 py-3">
      <InvitationsHeader />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Подписчики ВК (id в ВК), креативные задачи и события после регистрации.
        </p>
        <Button type="button" size="lg" className="shrink-0" onClick={openCreate} disabled={!roomId}>
          Создать приглашение
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
      ) : sortedInvitations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока нет приглашений. Создайте запись с subscriberId ВК после регистрации.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedInvitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              invitation={inv}
              resolveTaskLabel={resolveTaskLabel}
              resolveEventLabel={resolveEventLabel}
              onEdit={openEdit}
              onDelete={setDeletingInvitation}
            />
          ))}
        </div>
      )}

      <InvitationFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        mode={formMode}
        roomId={roomId}
        slug={slug ?? ""}
        invitation={formMode === "edit" ? editingInvitation : null}
      />

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
}
