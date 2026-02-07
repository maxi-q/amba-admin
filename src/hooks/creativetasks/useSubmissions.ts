import { QueryKeys } from '@/config/tanstack/queryKeys';
import creativeTaskService from '@services/creativetasks/creativetasks.service';
import type { IGetSubmissionsRequest } from '@services/creativetasks/creativetasks.types';
import { useQuery } from '@tanstack/react-query';

export function useSubmissions(taskId: string, data: IGetSubmissionsRequest) {
  const { data: submissionsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.SUBMISSIONS, taskId, data.page, data.size, data.status],
    queryFn: () => creativeTaskService.getSubmissions(taskId, data),
    enabled: !!taskId,
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    submissions: submissionsData?.data?.items ?? [],
    pagination: submissionsData?.data ? {
      page: submissionsData.data.page,
      size: submissionsData.data.size,
      total: submissionsData.data.total,
      totalPages: submissionsData.data.totalPages
    } : null,
  };
}
