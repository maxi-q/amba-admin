import { QueryKeys } from '@/config/tanstack/queryKeys';
import sprintsService from '@/services/sprints/sprints.service';
import { useQuery } from '@tanstack/react-query';
import type { IGetSprintsRequest } from '@/services/sprints/sprints.types';

export function useSprints(data: IGetSprintsRequest, roomId: string) {
  const { data: sprintsData, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.SPRINTS, roomId, data.page, data.size],
    queryFn: () => sprintsService.getSprints(data, roomId),
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
