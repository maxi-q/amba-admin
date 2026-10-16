import type { GetProjectResponseDto } from "@/api/generated/model";

export function getProjectVkCommunityId(project?: Pick<GetProjectResponseDto, "channelTypeId" | "channelExternalId"> & Partial<Pick<GetProjectResponseDto, "provider">>) {
  // Older Senler.ru responses omit provider; explicit non-RU projects must never get VK links.
  if (!project || (project.provider !== undefined && project.provider !== "SENLER_RU") || project.channelTypeId !== 1) return undefined;
  const id = project.channelExternalId?.trim().replace(/^-/, "");
  return id && /^[1-9]\d*$/.test(id) ? id : undefined;
}

export function getSenlerSubscriptionUrl(communityId: string | undefined, subscriptionId: string | number | null | undefined) {
  const normalizedSubscriptionId = String(subscriptionId ?? "").trim();

  return communityId && /^[1-9]\d*$/.test(communityId) && /^[1-9]\d*$/.test(normalizedSubscriptionId)
    ? `https://vk.com/app5898182_-${communityId}#s=${normalizedSubscriptionId}&force=1`
    : "";
}
