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
  message: {
    message: string,
    error: string,
    statusCode: number
  };
}

export type IApiErrorResponse = IValidationError | IApiError;

export class ApiError extends Error {
  public statusCode: number;
  public timestamp: string;
  public path: string;
  public fieldErrors?: Record<string, string[]>;

  constructor(errorResponse: IApiErrorResponse, fieldErrors?: Record<string, string[]>) {
    const message = typeof errorResponse.message.message === 'string'
      ? errorResponse.message.message
      : 'Validation error';

    super(message);
    this.name = 'ApiError';
    this.statusCode = errorResponse.statusCode;
    this.timestamp = errorResponse.timestamp;
    this.path = errorResponse.path;
    this.fieldErrors = fieldErrors;
  }
}