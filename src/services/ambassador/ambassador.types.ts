export interface IGetAmbassadorsRequest {
  ambassadorIds?: number[];
  roomIds?: number[];
  nameContains?: string;
  phoneContains?: string;
  innContains?: string;
  page?: number;
  size?: number;
}

export interface IAmbassador {
  id: string;
  createdAt: string;
  updatedAt: string;
  promoCode: string;
  channelTypeId: number;
  subscriberId: string;
}

export interface IGetAmbassadorsResponse {
  items: IAmbassador[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface IGetRoomApplicationsRequest {
  status: 'pending' | 'approved' | 'rejected';
  roomIds: string[];
  page: number;
  size: number;
}

export interface IRoomApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  inn: number;
  phone: string;
  juridicalType: 'physical' | 'ip' | 'juridical' | null;
  status: 'pending' | 'approved' | 'rejected';
  ambassadorId: string;
  roomId: string;
  /** ID OrdPerson (BaseAmbassadorRoomApplicationDto) — нужен для ОРД-договоров */
  ordPersonId: string;
}
export interface IGetRoomApplicationsResponse {
  items: IRoomApplication[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface IApproveRoomApplicationsRequest {
  ids: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface IApproveRoomApplicationsResponse {
  updatedCount: number;
}

export interface IGetEventApplicationsRequest {
  status: 'pending' | 'approved' | 'rejected';
  eventIds: string[];
  page: number;
  size: number;
}

export interface IEventApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  ambassadorId: string;
  eventId: string;
}

export interface IGetEventApplicationsResponse {
  items: IEventApplication[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface IApproveEventApplicationsRequest {
  ids: string[];
}

export interface IApproveEventApplicationsResponse {
  approvedCount: 0;
}

export interface IApproveAllPendingRoomApplicationsRequest {
  roomId: string;
}

export interface IApproveAllPendingRoomApplicationsResponse {
  approvedCount: number
}

/** Элемент списка GET ambassador/me/ord-contracts (ОРД-контракты текущего амбассадора) — дополнить полями по OpenAPI */
export interface IOrdContract {
  id: string
}

export type IGetMyOrdContractsResponse = IOrdContract[]