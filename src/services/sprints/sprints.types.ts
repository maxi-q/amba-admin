export interface ICreateSprintRequest {
  name: string,
  startDate: string | null,
  endDate: string | null,
  ignoreEndDate: boolean,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  roomId: string,
  isDeleted: boolean,
}

export interface ICreateSprintResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  startDate: string,
  endDate: string,
  ignoreEndDate: boolean,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isHidden: boolean,
  roomId: string,
  isDeleted: boolean,
}

export interface ISprint {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  startDate: string | null,
  endDate: string | null,
  ignoreEndDate: boolean,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
  roomId: string,
}

export interface IGetSprintsResponse {
  items: ISprint[];
  page: number;
  size: number;
  total: number;
  totalPages: number;}

export interface IGetSprintsRequest {
  page: number
  size: number
}

export interface IPatchSprintsRequest {
  name: string,
  startDate: string | null,
  endDate: string | null,
  ignoreEndDate: boolean,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
}

export interface IPatchSprintsResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  startDate: string | null,
  endDate: string | null,
  ignoreEndDate: boolean,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
  roomId: string
}