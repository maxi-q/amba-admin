export interface ICreateSprintRequest {
  name: string;
  startDate: string;
  endDate: string;
  rewardType: string;
  rewardUnits: string;
  rewardValue: number;
  promoCodeUsageLimit: number;
  roomId: string;
}

export interface ICreateSprintResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  startDate: string;
  endDate: string;
  rewardType: string;
  rewardUnits: string;
  rewardValue: number;
  promoCodeUsagesCount: number;
  promoCodeUsageLimit: number;
  isHidden: boolean;
  roomId: string;
}

export interface ISprint {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  startDate: string;
  endDate: string;
  rewardType: string;
  rewardUnits: string;
  rewardValue: number;
  promoCodeUsageLimit: number;
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
  startDate: string,
  endDate: string,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsageLimit: number
}

export interface IPatchSprintsResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  startDate: string,
  endDate: string,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  isHidden: boolean,
  roomId: string
}