import { QueryKeys } from '@/config/tanstack/queryKeys';
import ambassadorService from '@services/ambassador/ambassador.service';
import type { IGetEventApplicationsRequest } from '@services/ambassador/ambassador.types';
import { useQuery } from '@tanstack/react-query';

export function useEventApplications(data: IGetEventApplicationsRequest) {
  const { data: applicationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.EVENT_APPLICATIONS, data.status, data.eventIds, data.page, data.size],
    queryFn: () => ambassadorService.getEventApplications(data),
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    applications: applicationsData?.data?.items ?? [],
    pagination: applicationsData ? {
      page: applicationsData.data.page,
      size: applicationsData.data.size,
      total: applicationsData.data.total,
      totalPages: applicationsData.data.totalPages
    } : null,
  };
}
