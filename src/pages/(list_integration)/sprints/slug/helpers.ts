import type { BaseSprintDto } from "@/api/generated/model";

export interface SprintFormData {
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  ignoreEndDate: boolean;
  rewardType: "fix";
  rewardUnits: string;
  rewardValue: number;
  promoCodeUsageLimit: number;
  ignorePromoCodeUsageLimit: boolean;
}

export const dateToInput = (yourDate: string | null) => {
  if (!yourDate) return null;
  let date = new Date(yourDate);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0] || null;
};

export const emptySprintFormData = (): SprintFormData => ({
  name: "",
  description: null,
  startDate: "",
  endDate: null,
  ignoreEndDate: false,
  rewardType: "fix",
  rewardUnits: "",
  rewardValue: Number.NaN,
  promoCodeUsageLimit: Number.NaN,
  ignorePromoCodeUsageLimit: false,
});

export const sprintToFormData = (sprint: BaseSprintDto): SprintFormData => ({
  name: sprint.name ?? "",
  description: sprint.description ?? null,
  startDate: dateToInput(sprint.startDate) ?? "",
  endDate: dateToInput(sprint.endDate),
  ignoreEndDate: sprint.ignoreEndDate,
  rewardType: sprint.rewardType ?? "fix",
  rewardUnits: sprint.rewardUnits ?? "",
  rewardValue: sprint.rewardValue ?? Number.NaN,
  promoCodeUsageLimit: sprint.promoCodeUsageLimit ?? Number.NaN,
  ignorePromoCodeUsageLimit: sprint.ignorePromoCodeUsageLimit,
});
