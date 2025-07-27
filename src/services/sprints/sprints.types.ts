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