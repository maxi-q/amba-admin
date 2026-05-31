import { QueryKeys } from '@/config/tanstack/queryKeys';
import { creativeTasksControllerGetSubmissions } from '@/api/generated/creative-tasks/creative-tasks';
import type { CreativeTasksControllerGetSubmissionsParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

export function useSubmissions(taskId: string, data: CreativeTasksControllerGetSubmissionsParams) {
  const { data: submissionsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.SUBMISSIONS, taskId, data.page, data.size, data.status],
    queryFn: () => creativeTasksControllerGetSubmissions(taskId, data),
    enabled: !!taskId,
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    submissions: submissionsData?.items ?? [],
    pagination: submissionsData ? {
      page: submissionsData.page,
      size: submissionsData.size,
      total: submissionsData.total,
      totalPages: submissionsData.totalPages
    } : null,
  };
}
