
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

// Service response wrapper (deprecated - will be removed)
export interface IServiceResponse<T> {
  data?: T;
  error?: IApiErrorResponse;
  fieldErrors?: Record<string, string[]>;
}