import { QueryKeys } from '@/config/tanstack/queryKeys';
import { sprintsControllerGetMySprints } from '@/api/generated/sprints/sprints';
import { useQuery } from '@tanstack/react-query';
import type { SprintsControllerGetMySprintsParams } from '@/api/generated/model';

export function useSprints(data: SprintsControllerGetMySprintsParams, roomId: string) {
  const { data: sprintsData, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.SPRINTS, roomId, data.page, data.size],
    queryFn: () => sprintsControllerGetMySprints(roomId, data),
    enabled: !!roomId, // Only run query if roomId is provided
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    sprints: sprintsData?.items ?? [],
    pagination: sprintsData ? {
      page: sprintsData.page,
      size: sprintsData.size,
      total: sprintsData.total,
      totalPages: sprintsData.totalPages
    } : null,
  };
}
