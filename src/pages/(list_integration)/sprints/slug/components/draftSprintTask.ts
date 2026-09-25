import type {
  CreateCreativeTaskRequestDto,
  CreativeTaskWithDefaultsDto,
  UpdateCreativeTaskRequestDto,
} from "@/api/generated/model";
import { CreateCreativeTaskRequestDtoTargetPlatform } from "@/api/generated/model";
import type { CreativeTaskFormat } from "../../../creativetasks/utils/creativetaskUtils";
import { parseRewardBalls } from "../../../creativetasks/utils/creativetaskUtils";

export type DraftSprintTaskPlatform =
  (typeof CreateCreativeTaskRequestDtoTargetPlatform)[keyof typeof CreateCreativeTaskRequestDtoTargetPlatform];
export type DraftSprintTaskOrdForm = NonNullable<
  CreateCreativeTaskRequestDto["ordForm"]
>;

export interface DraftSprintTask {
  id: string;
  isPersisted: boolean;
  title: string;
  description: string;
  prohibited: string;
  criteria: string[];
  allowedFormats: CreativeTaskFormat[];
  targetPlatform: DraftSprintTaskPlatform;
  ordForm: DraftSprintTaskOrdForm | "";
  ordKktus: string[];
  ordContractTemplateId: string;
  targetUrls: string[];
  allowAmbassadorTargetUrl: boolean;
  defaultTexts: string[];
  allowAmbassadorText: boolean;
  defaultMediaIds: string[];
  allowAmbassadorMedia: boolean;
  publicationsCount: number;
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
  isPersisted: false,
  title: "",
  description: "",
  prohibited: "",
  criteria: [""],
  allowedFormats: ["POST"],
  targetPlatform: CreateCreativeTaskRequestDtoTargetPlatform.YOUTUBE_CHANNEL,
  ordForm: "",
  ordKktus: [],
  ordContractTemplateId: "",
  targetUrls: [""],
  allowAmbassadorTargetUrl: false,
  defaultTexts: [""],
  allowAmbassadorText: false,
  defaultMediaIds: [],
  allowAmbassadorMedia: false,
  publicationsCount: 1,
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

export function creativeTaskToDraft(task: CreativeTaskWithDefaultsDto): DraftSprintTask {
  return {
    id: task.id, isPersisted: true, title: task.title, description: task.description ?? "",
    prohibited: task.restrictions?.join("\n") ?? "",
    criteria: task.criteria?.length ? [...task.criteria] : [""],
    allowedFormats: [...(task.allowedFormats ?? [])], targetPlatform: task.targetPlatform,
    ordForm: task.ordForm ?? "", ordKktus: [...(task.ordKktus ?? [])],
    ordContractTemplateId: task.ordContractTemplateId ?? "",
    targetUrls: task.defaultTargetUrls?.length ? [...task.defaultTargetUrls] : [""],
    allowAmbassadorTargetUrl: task.allowAmbassadorTargetUrl,
    defaultTexts: task.defaultTexts?.length ? [...task.defaultTexts] : [""],
    allowAmbassadorText: task.allowAmbassadorText, defaultMediaIds: [...(task.defaultMediaIds ?? [])],
    allowAmbassadorMedia: task.allowAmbassadorMedia, publicationsCount: task.publicationsCount,
    requireMaterialsReview: task.requireMaterialsReview, requirePublicationReview: task.requirePublicationReview,
    minimalRewardInBalls: String(task.minimalRewardInBalls),
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
  sprintId: string
): CreateCreativeTaskRequestDto {
  const defaultTargetUrls = cleanList(task.targetUrls);
  const defaultTexts = cleanList(task.defaultTexts);
  const restrictions = prohibitedToRestrictions(task.prohibited);

  return {
    title: task.title.trim(),
    description: task.description.trim() || null,
    roomId,
    sprintId,
    criteria: cleanList(task.criteria),
    restrictions,
    allowedFormats: task.allowedFormats,
    targetPlatform: task.targetPlatform,
    minimalRewardInBalls: parseRewardBalls(task.minimalRewardInBalls),
    ordForm: task.ordForm || null,
    ordPayType: "other",
    ordKktus: task.ordKktus,
    allowAmbassadorMedia: task.allowAmbassadorMedia,
    allowAmbassadorText: task.allowAmbassadorText,
    allowAmbassadorTargetUrl: task.allowAmbassadorTargetUrl,
    publicationsCount: task.publicationsCount,
    requireMaterialsReview: task.requireMaterialsReview,
    requirePublicationReview: task.requirePublicationReview,
    ordContractTemplateId: task.ordContractTemplateId,
    defaultMediaIds: task.defaultMediaIds,
    defaultTexts: defaultTexts.length ? defaultTexts : undefined,
    defaultTargetUrls: defaultTargetUrls.length ? defaultTargetUrls : undefined,
  };
}

export function draftTaskToUpdatePayload(
  task: DraftSprintTask,
  sprintId: string
): UpdateCreativeTaskRequestDto {
  const { roomId: _roomId, ordContractTemplateId, ordPayType: _ordPayType, ...payload } =
    draftTaskToCreatePayload(task, "", sprintId);
  void _roomId;
  void _ordPayType;

  return {
    ...payload,
    ...(ordContractTemplateId ? { ordContractTemplateId } : {}),
    defaultMediaIds: [...task.defaultMediaIds],
    defaultTexts: cleanList(task.defaultTexts),
    defaultTargetUrls: cleanList(task.targetUrls),
  };
}

export function formatXpLabel(value: string | number): string {
  const amount = typeof value === "string" ? parseRewardBalls(value) : value;
  if (amount <= 0) return "без XP";
  return `от ${amount} XP`;
}
