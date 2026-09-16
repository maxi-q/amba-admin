import type { BaseAfterRegistrationInvitationDto, BaseAmbassadorDto, BaseAmbassadorRoomApplicationDto } from "@/api/generated/model";

export type ParticipantSection = "active" | "applications" | "invitations";

export async function collectParticipantPages<T>(getPage: (page: number) => Promise<{ items: T[]; totalPages: number }>) {
  const first = await getPage(1);
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    items.push(...(await getPage(page)).items);
  }
  return items;
}

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string | null;
  profileUrl?: string;
  invitationId?: string;
  cancellationUnavailable?: string;
  role?: "owner" | "admin" | "editor" | "viewer";
}

export function vkProfileUrl(channelTypeId: number, subscriberId: string) {
  return channelTypeId === 1 && /^[1-9]\d*$/.test(subscriberId)
    ? `https://vk.com/id${subscriberId}`
    : undefined;
}

export function applicationParticipants(applications: BaseAmbassadorRoomApplicationDto[], ambassadors: BaseAmbassadorDto[]): Participant[] {
  const profiles = new Map(ambassadors.map((item) => [item.id, item]));
  return applications.map((item) => {
    const profile = profiles.get(item.ambassadorId);
    return {
      id: item.id,
      name: item.name || profile?.username || item.ambassadorId,
      avatarUrl: profile?.avatarUrl,
      profileUrl: profile ? vkProfileUrl(profile.channelTypeId, profile.subscriberId) : undefined,
    };
  });
}

export function invitationParticipants(invitations: BaseAfterRegistrationInvitationDto[]): Participant[] {
  return invitations.flatMap((invitation) => invitation.targets.filter((target) => !target.processed).map((target) => ({
    id: target.id,
    // The API has no name/avatar for a person who has not registered yet.
    name: `${target.channelTypeId === 1 ? "VK" : target.channelTypeId === 2 ? "Telegram" : "ID"} · ${target.subscriberId}`,
    profileUrl: vkProfileUrl(target.channelTypeId, target.subscriberId),
    invitationId: invitation.id,
    cancellationUnavailable: invitation.targets.length > 1
      ? "В этом приглашении несколько пользователей. API пока не поддерживает отмену для одного пользователя."
      : undefined,
  })));
}

export function filterParticipants(participants: Participant[], search: string) {
  const query = search.trim().toLocaleLowerCase("ru-RU");
  return participants.filter((item) => `${item.name} ${item.profileUrl ?? ""}`.toLocaleLowerCase("ru-RU").includes(query));
}
