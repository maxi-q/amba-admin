import { QueryKeys } from '@/config/tanstack/queryKeys';
import invitationsService from '@services/invitations/invitations.service';
import { useQuery } from '@tanstack/react-query';
import { normalizeInvitationsResponse } from './normalizeInvitationsResponse';

export function useRoomInvitations(roomId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.INVITATIONS, roomId],
    queryFn: async () => {
      const res = await invitationsService.getInvitationsByRoom(roomId);
      return normalizeInvitationsResponse(res.data);
    },
    enabled: !!roomId,
    staleTime: 0,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    invitations: data ?? [],
  };
}
