import { QueryKeys } from '@/config/tanstack/queryKeys';
import { afterRegistrationInvitationsControllerGetInvitations } from '@/api/generated/after-registration-invitations/after-registration-invitations';
import { useQuery } from '@tanstack/react-query';
import { normalizeInvitationsResponse } from './normalizeInvitationsResponse';

export function useRoomInvitations(roomId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.INVITATIONS, roomId],
    queryFn: async () => {
      const res = await afterRegistrationInvitationsControllerGetInvitations(roomId);
      return normalizeInvitationsResponse(res);
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
