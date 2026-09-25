import { QueryKeys } from '@/config/tanstack/queryKeys';
import { ambassadorControllerGetAmbassadors } from '@/api/generated/ambassador/ambassador';
import type { AmbassadorControllerGetAmbassadorsParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';
import { collectPages, type AllPagesOptions } from '../collectPages';

export function useAmbassadors(data: AmbassadorControllerGetAmbassadorsParams, { allPages = false, enabled = true }: AllPagesOptions & { enabled?: boolean } = {}) {
  const { data: ambassadorsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.AMBASSADORS, allPages ? 'all' : data.page, data.size, data.ambassadorIds, data.roomIds, data.nameContains, data.phoneContains, data.innContains],
    queryFn: async ({ signal }) => {
      if (!allPages) return ambassadorControllerGetAmbassadors(data, undefined, signal);
      const ids = data.ambassadorIds;
      const first = await collectPages((page) => ambassadorControllerGetAmbassadors({ ...data, ambassadorIds: ids?.slice(0, 100), page, size: 100 }, undefined, signal));
      for (let offset = 100; ids && offset < ids.length; offset += 100) {
        const batch = await collectPages((page) => ambassadorControllerGetAmbassadors({ ...data, ambassadorIds: ids.slice(offset, offset + 100), page, size: 100 }, undefined, signal));
        first.items.push(...batch.items);
      }
      return { ...first, total: first.items.length, totalPages: 1, size: first.items.length };
    },
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    ambassadors: ambassadorsData?.items ?? [],
    pagination: ambassadorsData ? {
      page: ambassadorsData.page,
      size: ambassadorsData.size,
      total: ambassadorsData.total,
      totalPages: ambassadorsData.totalPages
    } : null,
  };
}
