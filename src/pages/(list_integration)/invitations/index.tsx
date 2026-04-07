import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Stack, Alert, Typography } from "@mui/material";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useEvents } from "@/hooks/events/useEvents";
import { useRoomInvitations } from "@/hooks/invitations/useRoomInvitations";
import { useDeleteInvitation } from "@/hooks/invitations/useDeleteInvitation";
import { Loader } from "@/components/Loader";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { InvitationsHeader } from "./components/InvitationsHeader";
import { InvitationCard } from "./components/InvitationCard";
import { InvitationFormDialog } from "./components/InvitationFormDialog";
import { DeleteInvitationDialog } from "./components/DeleteInvitationDialog";
import type { IInvitation } from "@services/invitations/invitations.types";
import { PRIMARY_COLOR } from "@/constants/colors";

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
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isRoomError || !room) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">{(roomError as Error)?.message ?? "Комната не найдена"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <InvitationsHeader />

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Подписчики ВК (id в ВК), креативные задачи и события после регистрации.
        </Typography>
        <Button
          variant="contained"
          onClick={openCreate}
          disabled={!roomId}
          sx={{
            backgroundColor: PRIMARY_COLOR,
            "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
          }}
        >
          Создать приглашение
        </Button>
      </Stack>

      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message ?? "Не удалось загрузить приглашения"}
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Loader />
        </Box>
      ) : sortedInvitations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Пока нет приглашений. Создайте запись с subscriberId ВК после регистрации.
        </Typography>
      ) : (
        <Stack spacing={2}>
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
        </Stack>
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
    </Box>
  );
}
