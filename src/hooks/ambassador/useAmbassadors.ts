import { QueryKeys } from '@/config/tanstack/queryKeys';
import ambassadorService from '@services/ambassador/ambassador.service';
import type { IGetAmbassadorsRequest } from '@services/ambassador/ambassador.types';
import { useQuery } from '@tanstack/react-query';

export function useAmbassadors(data: IGetAmbassadorsRequest) {
  const { data: ambassadorsData, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.AMBASSADORS, data.page, data.size, data.ambassadorIds, data.roomIds, data.nameContains, data.phoneContains, data.innContains],
    queryFn: () => ambassadorService.getAmbassadors(data),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    ambassadors: ambassadorsData?.data?.items ?? [],
    pagination: ambassadorsData ? {
      page: ambassadorsData.data.page,
      size: ambassadorsData.data.size,
      total: ambassadorsData.data.total,
      totalPages: ambassadorsData.data.totalPages
    } : null,
  };
}
