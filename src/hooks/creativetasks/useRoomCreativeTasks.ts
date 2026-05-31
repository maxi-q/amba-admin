import { QueryKeys } from '@/config/tanstack/queryKeys';
import { creativeTasksControllerGetCreativeTasks } from '@/api/generated/creative-tasks/creative-tasks';
import type { CreativeTasksControllerGetCreativeTasksParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

export function useRoomCreativeTasks(roomId: string, data: CreativeTasksControllerGetCreativeTasksParams) {
  const { data: tasksData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.CREATIVE_TASKS, roomId, data.page, data.size],
    queryFn: () => creativeTasksControllerGetCreativeTasks(roomId, data),
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
    pagination: tasksData ? {
      page: tasksData.page,
      size: tasksData.size,
      total: tasksData.total,
      totalPages: tasksData.totalPages
    } : null,
  };
}
