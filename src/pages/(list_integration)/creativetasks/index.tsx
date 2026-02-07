import { useParams } from "react-router-dom";
import { useState } from "react";
import { Box, Stack, FormControl, InputLabel, Select, MenuItem, Pagination } from "@mui/material";
import { Loader } from "@/components/Loader";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { CreativeTasksHeader } from "./components/CreativeTasksHeader";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { CreativeTasksEmptyState } from "./components/CreativeTasksEmptyState";
import { CreateCreativeTaskButton } from "./components/CreateCreativeTaskButton";
import { CreativeTaskCard } from "./components/CreativeTaskCard";
import { CreateCreativeTaskDialog } from "./components/CreateCreativeTaskDialog";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { PRIMARY_COLOR } from "@/constants/colors";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Страница «Креативные задачи» комнаты.
 * Список задач с пагинацией, создание и редактирование, раскрытие заявок по задаче.
 */
export default function CreativeTasksPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<ICreativeTask | null>(null);

  const {
    room: roomData,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError
  } = useGetRoomById(slug ?? "");

  const roomId = roomData?.id ?? "";

  const {
    tasks,
    isLoading: isLoadingTasks,
    isError: isTasksError,
    error: tasksError,
    refetch,
    pagination
  } = useRoomCreativeTasks(roomId, { page, size: pageSize });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: { target: { value: unknown } }) => {
    const size = Number(event.target.value);
    setPageSize(size);
    setPage(1);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    setEditTask(null);
    refetch();
  };

  if (isLoadingRoom) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isRoomError) {
    return (
      <CreativeTasksErrorState
        errorMessage={(roomError as Error)?.message}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <CreativeTasksHeader />

      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <CreateCreativeTaskButton
            onClick={() => setCreateDialogOpen(true)}
          />
          {pagination && pagination.totalPages > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>На странице</InputLabel>
                <Select
                  value={pageSize}
                  label="На странице"
                  onChange={handlePageSizeChange}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>

        {isLoadingTasks ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Loader />
          </Box>
        ) : isTasksError ? (
          <CreativeTasksErrorState
            errorMessage={(tasksError as Error)?.message}
          />
        ) : tasks.length === 0 && !pagination?.total ? (
          <CreativeTasksEmptyState
            onCreateClick={() => setCreateDialogOpen(true)}
          />
        ) : (
          <>
            {pagination && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1
                }}
              >
                <Box component="span" sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                  Всего: {pagination.total}
                </Box>
              </Box>
            )}

            <Stack spacing={2}>
              {tasks.map((task) => (
                <CreativeTaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditTask}
                />
              ))}
            </Stack>

            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": {
                      backgroundColor: PRIMARY_COLOR
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Stack>

      <CreateCreativeTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        roomId={roomId}
        onSuccess={handleCreateSuccess}
      />

      <EditCreativeTaskDialog
        open={!!editTask}
        onClose={() => setEditTask(null)}
        task={editTask}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
}
