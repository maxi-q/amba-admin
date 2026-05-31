import { QueryKeys } from '@/config/tanstack/queryKeys';
import { ambassadorControllerGetAmbassadors } from '@/api/generated/ambassador/ambassador';
import type { AmbassadorControllerGetAmbassadorsParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

export function useAmbassadors(data: AmbassadorControllerGetAmbassadorsParams) {
  const { data: ambassadorsData, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.AMBASSADORS, data.page, data.size, data.ambassadorIds, data.roomIds, data.nameContains, data.phoneContains, data.innContains],
    queryFn: () => ambassadorControllerGetAmbassadors(data),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    ambassadors: ambassadorsData?.items ?? [],
    pagination: ambassadorsData ? {
      page: ambassadorsData.page,
      size: ambassadorsData.size,
      total: ambassadorsData.total,
      totalPages: ambassadorsData.totalPages
    } : null,
  };
}
