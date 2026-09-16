import { useQuery } from "@tanstack/react-query";
import { ambassadorControllerGetAmbassadors, ambassadorControllerGetRoomApplications } from "@/api/generated/ambassador/ambassador";
import { afterRegistrationInvitationsControllerGetInvitations } from "@/api/generated/after-registration-invitations/after-registration-invitations";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { applicationParticipants, collectParticipantPages, invitationParticipants } from "./participants";
import type { ParticipantSection } from "./participants";

export function useParticipantList(roomId: string, section: ParticipantSection, enabled: boolean) {
  const query = useQuery({
    queryKey: section === "invitations"
      ? [QueryKeys.INVITATIONS, roomId, "participants"]
      : [QueryKeys.ROOM_APPLICATIONS, "participants", roomId, section],
    enabled: enabled && !!roomId,
    queryFn: async ({ signal }) => {
      // ponytail: client-side search loads all pages; replace with server search when the API supports it.
      if (section === "invitations") {
        const invitations = await collectParticipantPages((page) => afterRegistrationInvitationsControllerGetInvitations(roomId, { page, size: 100 }, undefined, signal));
        return invitationParticipants(invitations);
      }
      const applications = await collectParticipantPages((page) => ambassadorControllerGetRoomApplications({ roomIds: [roomId], status: section === "active" ? "approved" : "pending", page, size: 100 }, undefined, signal));
      const ids = [...new Set(applications.map((item) => item.ambassadorId))];
      const profiles = [];
      for (let offset = 0; offset < ids.length; offset += 100) {
        profiles.push(...await collectParticipantPages((page) => ambassadorControllerGetAmbassadors({ ambassadorIds: ids.slice(offset, offset + 100), page, size: 100 }, undefined, signal)));
      }
      return applicationParticipants(applications, profiles);
    },
  });
  return { ...query, participants: query.data ?? [] };
}
