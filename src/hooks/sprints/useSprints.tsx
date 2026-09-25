import { QueryKeys } from '@/config/tanstack/queryKeys';
import { sprintsControllerGetMySprints } from '@/api/generated/sprints/sprints';
import { useQuery } from '@tanstack/react-query';
import type { SprintsControllerGetMySprintsParams } from '@/api/generated/model';
import { collectPages, type AllPagesOptions } from '../collectPages';

export function useSprints(data: SprintsControllerGetMySprintsParams, roomId: string, { allPages = false }: AllPagesOptions = {}) {
  const { data: sprintsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.SPRINTS, roomId, allPages ? 'all' : data.page, data.size, data.include],
    queryFn: ({ signal }) => allPages
      ? collectPages((page) => sprintsControllerGetMySprints(roomId, { ...data, page }, undefined, signal))
      : sprintsControllerGetMySprints(roomId, data, undefined, signal),
    enabled: !!roomId, // Only run query if roomId is provided
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    sprints: sprintsData?.items ?? [],
    pagination: sprintsData ? {
      page: sprintsData.page,
      size: sprintsData.size,
      total: sprintsData.total,
      totalPages: sprintsData.totalPages
    } : null,
  };
}
