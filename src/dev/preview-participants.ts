import type { AxiosRequestConfig } from "axios";
import type { BaseAfterRegistrationInvitationDto, BaseAmbassadorDto, BaseAmbassadorRoomApplicationDto, CreateInvitationRequestDto, UpdateRoomApplicationsStatusRequestDto } from "@/api/generated/model";

const roomId = "preview-room";
const timestamp = "2026-09-15T09:00:00.000Z";

export function createParticipantsPreview(sourceAmbassadors: BaseAmbassadorDto[], avatarUrl?: string) {
  const ambassadors = sourceAmbassadors.map((item) => ({ ...item, avatarUrl: avatarUrl ?? item.avatarUrl }));
  const applicants: BaseAmbassadorDto[] = ["Иван Смирнов", "Мария Волкова", "Олег Лебедев"].map((username, index) => ({
    id: `applicant-${index}`, createdAt: timestamp, updatedAt: timestamp, username, channelTypeId: 1,
    subscriberId: String(11000 + index), avatarUrl: ambassadors[0]?.avatarUrl ?? null,
  }));
  let applications: BaseAmbassadorRoomApplicationDto[] = [...ambassadors, ...applicants].map((person, index) => ({
    id: `application-${person.id}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    ordPersonId: `ord-person-${person.id}`,
    name: person.username,
    phone: "+79000000000",
    inn: 123456789012,
    ambassadorId: person.id,
    roomId,
    status: index < ambassadors.length ? "approved" : "pending",
    balls: 100 * index,
    externalUserId: person.subscriberId,
  }));
  let invitations: BaseAfterRegistrationInvitationDto[] = Array.from({ length: 4 }, (_, index) => ({
    id: `participant-invitation-${index}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    roomId,
    eventIds: [],
    targets: [{ id: `invitation-target-${index}`, createdAt: timestamp, updatedAt: timestamp, channelTypeId: 1, subscriberId: String(10100 + index), processed: false }],
  }));
  const paginate = <T,>(items: T[], params: { page?: number; size?: number } = {}) => {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 100;
    return { items: items.slice((page - 1) * size, page * size), page, size, total: items.length, totalPages: Math.ceil(items.length / size) };
  };

  return (config: AxiosRequestConfig): unknown => {
    const method = config.method?.toUpperCase();
    const url = config.url ?? "";
    const data = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    if (method === "GET" && url === "/api/ambassador" && config.params?.ambassadorIds?.length) {
      return paginate([...ambassadors, ...applicants].filter((item) => config.params.ambassadorIds.includes(item.id)), config.params);
    }
    if (method === "GET" && url === "/api/ambassador/room-applications") {
      return paginate(applications.filter((item) => (!config.params?.status || item.status === config.params.status) && (!config.params?.roomIds?.length || config.params.roomIds.includes(item.roomId))), config.params);
    }
    if (method === "PATCH" && url === "/api/ambassador/room-applications/status") {
      const update = data as UpdateRoomApplicationsStatusRequestDto;
      applications = applications.map((item) => update.ids.includes(item.id) ? { ...item, status: update.status } : item);
      return { success: true };
    }
    if (method === "GET" && url === `/api/invitations/room/${roomId}`) return paginate(invitations, config.params);
    if (method === "POST" && url === "/api/invitations/parse-vk-user-id") {
      const match = String(data.input).trim().match(/^(?:(?:https?:\/\/)?(?:m\.)?vk\.com\/)?(?:id)?([1-9]\d*)\/?$/i);
      if (!match) throw new Error("На мок-стенде используйте ссылку вида https://vk.com/id123");
      return { vkUserId: match[1] };
    }
    if (method === "POST" && url === "/api/invitations") {
      const input = data as CreateInvitationRequestDto;
      const invitation: BaseAfterRegistrationInvitationDto = {
        id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp, roomId: input.roomId,
        eventIds: input.eventIds ?? [],
        targets: input.targets.map((target) => ({ ...target, id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp, processed: false })),
      };
      invitations = [...invitations, invitation];
      return invitation;
    }
    if (method === "DELETE" && url.startsWith("/api/invitations/")) {
      const id = url.split("/").at(-1);
      if (!invitations.some((item) => item.id === id)) throw new Error("Приглашение не найдено");
      invitations = invitations.filter((item) => item.id !== id);
      return { success: true };
    }
    return undefined;
  };
}
