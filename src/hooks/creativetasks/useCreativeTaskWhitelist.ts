import { QueryKeys } from '@/config/tanstack/queryKeys';
import creativeTaskService from '@services/creativetasks/creativetasks.service';
import type { IGetCreativeTaskWhitelistRequest } from '@services/creativetasks/creativetasks.types';
import { useQuery } from '@tanstack/react-query';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 50;

export function useCreativeTaskWhitelist(
  taskId: string,
  params: IGetCreativeTaskWhitelistRequest = {}
) {
  const page = params.page ?? DEFAULT_PAGE;
  const size = params.size ?? DEFAULT_SIZE;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.CREATIVE_TASK_WHITELIST, taskId, page, size],
    queryFn: () =>
      creativeTaskService.getCreativeTaskWhitelist(taskId, { page, size }),
    enabled: !!taskId,
    staleTime: 30 * 1000,
    retry: 2,
  });

  const payload = data?.data;

  return {
    isLoading,
    isError,
    error,
    refetch,
    items: payload?.items ?? [],
    pagination: payload
      ? {
          page: payload.page,
          size: payload.size,
          total: payload.total,
          totalPages: payload.totalPages,
        }
      : null,
  };
}
