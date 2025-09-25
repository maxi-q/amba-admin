
export interface ICreateRoomRequest {
  name: string;
  webhookUrl: string;
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

// Service response wrapper
export interface IServiceResponse<T> {
  data?: T;
  error?: IApiErrorResponse;
  fieldErrors?: Record<string, string[]>;
}