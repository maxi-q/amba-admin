import { QueryKeys } from '@/config/tanstack/queryKeys';
import { ambassadorControllerGetRoomApplications } from '@/api/generated/ambassador/ambassador';
import type { AmbassadorControllerGetRoomApplicationsParams } from '@/api/generated/model';
import { useQuery } from '@tanstack/react-query';

export function useRoomApplications(data: AmbassadorControllerGetRoomApplicationsParams) {
  const { data: applicationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOM_APPLICATIONS, data.status, data.roomIds, data.page, data.size],
    queryFn: () => ambassadorControllerGetRoomApplications(data),
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
