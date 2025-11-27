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