import { QueryKeys } from '@/config/tanstack/queryKeys';
import { privateCreativeTasksControllerGetWhitelist } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import type { PrivateCreativeTasksControllerGetWhitelistParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

type CreativeTaskWhitelistResponse = {
  items: Array<{
    ambassadorId: string;
    promoCode?: string;
  }>;
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 50;

export function useCreativeTaskWhitelist(
  taskId: string,
  params: PrivateCreativeTasksControllerGetWhitelistParams = {}
) {
  const page = params.page ?? DEFAULT_PAGE;
  const size = params.size ?? DEFAULT_SIZE;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.CREATIVE_TASK_WHITELIST, taskId, page, size],
    queryFn: () =>
      privateCreativeTasksControllerGetWhitelist(taskId, { page, size }) as unknown as Promise<CreativeTaskWhitelistResponse>,
    enabled: !!taskId,
    staleTime: 30 * 1000,
    retry: 2,
  });

  const payload = data;

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
