import { QueryKeys } from '@/config/tanstack/queryKeys';
import { ambassadorControllerGetEventApplications } from '@/api/generated/ambassador/ambassador';
import type { AmbassadorControllerGetEventApplicationsParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

export function useEventApplications(data: AmbassadorControllerGetEventApplicationsParams) {
  const { data: applicationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.EVENT_APPLICATIONS, data.status, data.eventIds, data.page, data.size],
    queryFn: () => ambassadorControllerGetEventApplications(data),
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    applications: applicationsData?.items ?? [],
    pagination: applicationsData ? {
      page: applicationsData.page,
      size: applicationsData.size,
      total: applicationsData.total,
      totalPages: applicationsData.totalPages
    } : null,
  };
}
