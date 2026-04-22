import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { CreativeTasksHeader } from "./components/CreativeTasksHeader";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { CreativeTasksEmptyState } from "./components/CreativeTasksEmptyState";
import { CreateCreativeTaskButton } from "./components/CreateCreativeTaskButton";
import { CreativeTaskCard } from "./components/CreativeTaskCard";
import { CreateCreativeTaskDialog } from "./components/CreateCreativeTaskDialog";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { CreativesPaginationControls } from "./components/CreativesPaginationControls";
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
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
  } = useGetRoomById(slug ?? "");

  const roomId = room?.id ?? "";

  const {
    tasks,
    isLoading: isLoadingTasks,
    isError: isTasksError,
    error: tasksError,
    refetch,
    pagination,
  } = useRoomCreativeTasks(roomId, { page, size: pageSize });

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  const handleCreateSuccess = () => {
    void refetch();
  };

  const handleEditSuccess = () => {
    setEditTask(null);
    void refetch();
  };

  if (isLoadingRoom) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
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
    <div className="w-full px-2 py-3">
      <CreativeTasksHeader />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CreateCreativeTaskButton
            onClick={() => setCreateDialogOpen(true)}
          />
          {pagination && pagination.totalPages > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">На странице</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Размер" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        {isLoadingTasks ? (
          <div className="flex justify-center py-8">
            <PageLoader label="Загрузка задач…" />
          </div>
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
            {pagination ? (
              <p className="text-sm text-muted-foreground">Всего: {pagination.total}</p>
            ) : null}

            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <CreativeTaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditTask}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <CreativesPaginationControls
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                className="mt-2"
              />
            ) : null}
          </>
        )}
      </div>

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
    </div>
  );
}
