import { QueryKeys } from '@/config/tanstack/queryKeys';
import { privateCreativeTasksControllerGetPrivateCreativeTasks } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import type { PrivateCreativeTasksControllerGetPrivateCreativeTasksParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

export function useRoomPrivateCreativeTasks(
  roomId: string,
  data: PrivateCreativeTasksControllerGetPrivateCreativeTasksParams
) {
  const { data: tasksData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.PRIVATE_CREATIVE_TASKS, roomId, data.page, data.size],
    queryFn: () => privateCreativeTasksControllerGetPrivateCreativeTasks(roomId, data),
    enabled: !!roomId,
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    tasks: tasksData?.items ?? [],
    pagination: tasksData
      ? {
          page: tasksData.page,
          size: tasksData.size,
          total: tasksData.total,
          totalPages: tasksData.totalPages,
        }
      : null,
  };
}
