export interface ICreateEventRequest {
  name: string,
  startDate: string,
  endDate: string,
  ignoreEndDate: boolean,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  rewardType: string,
  rewardValue: number,
  rewardUnits: string,
  roomId: string
}

export interface ICreateEventResponse {
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
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  rewardType: string,
  rewardValue: number,
  rewardUnits: string,
  roomId: string
}

export interface IEvent {
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
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean
}

export interface IGetEventsResponse {
  items: IEvent[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface IGetEventsRequest {
  page: number
  size: number
}

export interface IPatchEventsRequest {
  name: string,
  startDate: string,
  endDate: string,
  ignoreEndDate: boolean,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  rewardType: string,
  rewardValue: number,
  rewardUnits: string
}

export interface IPatchEventsResponse {
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
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  rewardType: string,
  rewardValue: number,
  rewardUnits: string,
  roomId: string
}