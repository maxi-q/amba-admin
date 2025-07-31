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
  name: string;
  startDate: string;
  endDate: string;
  rewardType: string;
  rewardUnits: string;
  rewardValue: number;
  promoCodeUsageLimit: number;
  roomId: string;
}

export interface IGetSprintsResponse {
  sprints: ICreateSprintResponse[];
}

export interface IPatchSprintsRequest {
  name: string,
  startDate: string,
  endDate: string,
  rewardType: string,
  rewardUnits: string,
  rewardValue: number,
  promoCodeUsageLimit: number,
  roomId: string
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