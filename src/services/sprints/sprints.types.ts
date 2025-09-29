export interface ICreateSprintRequest {
  name: string,
  startDate: string,
  endDate: string,
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
  isDeleted: boolean,
  roomId: string
}

export interface IApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly path: string;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(errorResponse: IApiErrorResponse, fieldErrors?: Record<string, string[]>) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.statusCode = errorResponse.statusCode;
    this.timestamp = errorResponse.timestamp;
    this.path = errorResponse.path;
    this.fieldErrors = fieldErrors;
  }
}