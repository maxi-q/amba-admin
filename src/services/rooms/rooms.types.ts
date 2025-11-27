
export interface ICreateRoomRequest {
  name: string;
  webhookUrl: string | null;
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
  isDeleted: boolean,
  projectId: string
}

export type ICreateRoomResponse = IRoomData

export type IGetRoomResponse = IRoomData

export interface IUpdateRoomsRequest {
  name?: string,
  webhookUrl?: string,
  isDeleted?: boolean
}

export type IUpdateRoomsResponse = IRoomData


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
  isDeleted: boolean,
  projectId: string
}

export type IRotateSecretKeyResponse = string

export interface IGetRoomAnalyticsRequest {
  ambassadorId?: string;
  eventId?: string;
  sprintId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IGetRoomAnalyticsResponse {
  items: {
    date: string;
    count: number;
  }[];
  total: number;
}

export interface IGetRoomPromoCodeUsagesRequest {
  ambassadorId?: string;
  eventId?: string;
  sprintId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export interface IGetRoomPromoCodeUsagesResponse {
  items: {
    id: string;
    projectId: string;
    roomId: string;
    sprintId: string;
    eventId: string;
    ambassadorId: string;
    uniqueId: string;
    additionalUniqueId: string;
    payload: object;
    createdAt: string;
  }[],
  page: number;
  size: number;
  total: number;
  totalPages: number;
}