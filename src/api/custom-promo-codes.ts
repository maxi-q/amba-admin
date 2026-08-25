import { customInstance } from "@/api/mutator/custom-instance";

export interface CustomPromoCodeDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  promoCode: string;
  rewardType: "fix";
  rewardValue: number;
  rewardUnits: string;
  promoCodeUsagesCount: number;
  promoCodeUsageLimit: number | null;
  startDate: string;
  endDate: string;
  roomId: string;
}

export interface CreateCustomPromoCodeRequestDto {
  name: string;
  promoCode: string;
  rewardType: "fix";
  rewardValue: number;
  rewardUnits: string;
  promoCodeUsageLimit?: number | null;
  startDate: string;
  endDate: string;
  roomId: string;
}

export type UpdateCustomPromoCodeRequestDto = Partial<
  Omit<CreateCustomPromoCodeRequestDto, "roomId">
>;

export const getCustomPromoCodes = (roomId: string) =>
  customInstance<CustomPromoCodeDto[]>({
    url: `/api/promo-code/custom/${roomId}`,
    method: "GET",
  });

export const createCustomPromoCode = (data: CreateCustomPromoCodeRequestDto) =>
  customInstance<CustomPromoCodeDto>({
    url: "/api/promo-code/custom",
    method: "POST",
    data,
  });

export const updateCustomPromoCode = (
  id: string,
  data: UpdateCustomPromoCodeRequestDto,
) =>
  customInstance<CustomPromoCodeDto>({
    url: `/api/promo-code/custom/${id}`,
    method: "PATCH",
    data,
  });
