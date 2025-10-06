export interface ILoginRequest {
  userId: string
  groupId: number
  context: string
  sign: string
}

export interface ILoginResponse {
  token: string
}

export interface IRegisterProjectRequest {
  groupId: number
  code: string
}

export interface IRegisterProjectResponse {
  id: string
  createdAt: string
  updatedAt: string
  groupId: number
  channelTypeId: number
  channelExternalId: string
}

export interface IAuthByTokenRequest {
  group_id: string
}

export interface IAuthByTokenResponse {
  id: string
  createdAt: string
  updatedAt: string
  groupId: number
  channelTypeId: number
  channelExternalId: string
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