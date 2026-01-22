import { QueryKeys } from '@/config/tanstack/queryKeys';
import ambassadorService from '@services/ambassador/ambassador.service';
import type { IGetRoomApplicationsRequest } from '@services/ambassador/ambassador.types';
import { useQuery } from '@tanstack/react-query';

export function useRoomApplications(data: IGetRoomApplicationsRequest) {
  const { data: applicationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOM_APPLICATIONS, data.status, data.roomIds, data.page, data.size],
    queryFn: () => ambassadorService.getRoomApplications(data),
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
