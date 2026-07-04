import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { privateCreativeTasksControllerGetSubmissions } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import type { PrivateCreativeTasksControllerGetSubmissionsParams } from '@/api/generated/model';

export function usePrivateSubmissions(
  privateTaskId: string,
  data: PrivateCreativeTasksControllerGetSubmissionsParams
) {
  const { data: submissionsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.SUBMISSIONS, 'private', privateTaskId, data.page, data.size, data.status],
    queryFn: () => privateCreativeTasksControllerGetSubmissions(privateTaskId, data),
    enabled: !!privateTaskId,
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
      totalPages: submissionsData.totalPages,
    } : null,
  };
}
