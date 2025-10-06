export interface ICreateEventRequest {
  name: string,
  promoCodesPrefix: string,
  startDate: string,
  endDate: string,
  ignoreEndDate: boolean,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
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
  promoCodesPrefix: string,
  startDate: string,
  endDate: string,
  ignoreEndDate: boolean,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
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
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean
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
  startDate: string | null,
  endDate: string | null,
  ignoreEndDate: boolean,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
  rewardType: string,
  rewardValue: number,
  rewardUnits: string,
}

export interface IPatchEventsResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  promoCodesPrefix: string,
  startDate: string,
  endDate: string,
  ignoreEndDate: boolean,
  pendingSubscriptionId: number,
  approvedSubscriptionId: number,
  rejectedSubscriptionId: number,
  promoCodeUsagesCount: number,
  promoCodeUsageLimit: number,
  ignorePromoCodeUsageLimit: boolean,
  isDeleted: boolean,
  rewardType: string,
  rewardValue: number,
  rewardUnits: string,
  roomId: string
}

// Error types
export interface IValidationError {
  statusCode: 422;
  timestamp: string;
  path: string;
  message: Record<string, string[]>;
}

export interface IApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
}

export type IApiErrorResponse = IValidationError | IApiError;

// Custom API Error class
export class ApiError extends Error {
  public statusCode: number;
  public timestamp: string;
  public path: string;
  public fieldErrors?: Record<string, string[]>;

  constructor(errorResponse: IApiErrorResponse, fieldErrors?: Record<string, string[]>) {
    const message = typeof errorResponse.message === 'string' 
      ? errorResponse.message 
      : 'Validation error';
    
    super(message);
    this.name = 'ApiError';
    this.statusCode = errorResponse.statusCode;
    this.timestamp = errorResponse.timestamp;
    this.path = errorResponse.path;
    this.fieldErrors = fieldErrors;
  }
}