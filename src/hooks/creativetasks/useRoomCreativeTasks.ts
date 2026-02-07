import { QueryKeys } from '@/config/tanstack/queryKeys';
import creativeTaskService from '@services/creativetasks/creativetasks.service';
import type { IGetRoomCreativeTasksRequest } from '@services/creativetasks/creativetasks.types';
import { useQuery } from '@tanstack/react-query';

export function useRoomCreativeTasks(roomId: string, data: IGetRoomCreativeTasksRequest) {
  const { data: tasksData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.CREATIVE_TASKS, roomId, data.page, data.size],
    queryFn: () => creativeTaskService.getRoomCreativeTasks(roomId, data),
    enabled: !!roomId,
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    tasks: tasksData?.data?.items ?? [],
    pagination: tasksData?.data ? {
      page: tasksData.data.page,
      size: tasksData.data.size,
      total: tasksData.data.total,
      totalPages: tasksData.data.totalPages
    } : null,
  };
}
