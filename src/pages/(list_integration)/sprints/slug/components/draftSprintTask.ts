import type { CreateCreativeTaskRequestDto } from "@/api/generated/model";
import { CreateCreativeTaskRequestDtoTargetPlatform } from "@/api/generated/model";
import type { CreativeTaskFormat } from "../../../creativetasks/utils/creativetaskUtils";
import { parseRewardBalls } from "../../../creativetasks/utils/creativetaskUtils";

export type DraftSprintTaskPlatform =
  (typeof CreateCreativeTaskRequestDtoTargetPlatform)[keyof typeof CreateCreativeTaskRequestDtoTargetPlatform];

export interface DraftSprintTask {
  id: string;
  title: string;
  description: string;
  prohibited: string;
  criteria: string[];
  allowedFormats: CreativeTaskFormat[];
  targetPlatform: DraftSprintTaskPlatform;
  ordKktus: string[];
  ordContractTemplateId: string;
  targetUrls: string[];
  allowAmbassadorTargetUrl: boolean;
  defaultTexts: string[];
  allowAmbassadorText: boolean;
  defaultMediaIds: string[];
  allowAmbassadorMedia: boolean;
  requireMaterialsReview: boolean;
  requirePublicationReview: boolean;
  minimalRewardInBalls: string;
}

export const PLATFORM_OPTIONS: { value: DraftSprintTaskPlatform; label: string }[] = [
  { value: CreateCreativeTaskRequestDtoTargetPlatform.VK_GROUP, label: "VK — сообщество" },
  { value: CreateCreativeTaskRequestDtoTargetPlatform.VK_USER, label: "VK — страница" },
  { value: CreateCreativeTaskRequestDtoTargetPlatform.YOUTUBE_CHANNEL, label: "YouTube" },
  { value: CreateCreativeTaskRequestDtoTargetPlatform.RUTUBE_CHANNEL, label: "Rutube" },
];

export const emptyDraftSprintTask = (): DraftSprintTask => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  prohibited: "",
  criteria: [""],
  allowedFormats: ["POST"],
  targetPlatform: CreateCreativeTaskRequestDtoTargetPlatform.YOUTUBE_CHANNEL,
  ordKktus: [],
  ordContractTemplateId: "",
  targetUrls: [""],
  allowAmbassadorTargetUrl: false,
  defaultTexts: [""],
  allowAmbassadorText: false,
  defaultMediaIds: [],
  allowAmbassadorMedia: false,
  requireMaterialsReview: true,
  requirePublicationReview: true,
  minimalRewardInBalls: "500",
});

export function cloneDraftSprintTask(task: DraftSprintTask): DraftSprintTask {
  return {
    ...task,
    criteria: [...task.criteria],
    allowedFormats: [...task.allowedFormats],
    ordKktus: [...task.ordKktus],
    targetUrls: [...task.targetUrls],
    defaultTexts: [...task.defaultTexts],
    defaultMediaIds: [...task.defaultMediaIds],
  };
}

function cleanList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

/** «Что запрещено» → массив restrictions (строки по переносам) */
function prohibitedToRestrictions(prohibited: string): string[] {
  return prohibited
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function draftTaskToCreatePayload(
  task: DraftSprintTask,
  roomId: string,
  sprintId: string,
  startsAt: string,
  endsAt: string | null
): CreateCreativeTaskRequestDto {
  const defaultTargetUrls = cleanList(task.targetUrls);
  const defaultTexts = cleanList(task.defaultTexts);
  const restrictions = prohibitedToRestrictions(task.prohibited);

  return {
    title: task.title.trim(),
    description: task.description.trim() || null,
    startsAt,
    endsAt,
    roomId,
    sprintId,
    criteria: cleanList(task.criteria),
    restrictions,
    allowedFormats: task.allowedFormats,
    targetPlatform: task.targetPlatform,
    minimalRewardInBalls: parseRewardBalls(task.minimalRewardInBalls),
    ordKktus: task.ordKktus,
    allowAmbassadorMedia: task.allowAmbassadorMedia,
    allowAmbassadorText: task.allowAmbassadorText,
    allowAmbassadorTargetUrl: task.allowAmbassadorTargetUrl,
    publicationsCount: 1,
    requireMaterialsReview: task.requireMaterialsReview,
    requirePublicationReview: task.requirePublicationReview,
    ordContractTemplateId: task.ordContractTemplateId,
    defaultMediaIds: task.defaultMediaIds,
    defaultTexts: defaultTexts.length ? defaultTexts : undefined,
    defaultTargetUrls: defaultTargetUrls.length ? defaultTargetUrls : undefined,
  };
}

export function formatXpLabel(value: string | number): string {
  const amount = typeof value === "string" ? parseRewardBalls(value) : value;
  if (amount <= 0) return "без XP";
  return `от ${amount} XP`;
}
