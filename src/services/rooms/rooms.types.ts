export interface ICreateRoomRequest {
  name: string;
  webhookUrl: string;
  secretKey: string;
}

export interface IRoomData {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  webhookUrl: string,
  secretKey: string,
  isHidden: boolean,
  sprints: Sprint[]
}

export type ICreateRoomResponse = IRoomData

export type IGetRoomResponse = IRoomData

export interface IUpdateRoomsRequest {
  name: string,
  webhookUrl: string,
  secretKey: string,
  isHidden: boolean
}

export type IUpdateRoomsResponse = IRoomData


export interface Sprint {
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

export interface IGetRoomByIdResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  webhookUrl: string,
  secretKey: string,
  isHidden: boolean,
  sprints: Sprint[]
}