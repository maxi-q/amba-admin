import { 
  isValidationError, 
  extractFieldErrors 
} from '@services/config/axios.helper';
import { ApiError, type IApiErrorResponse } from '@/types';

export abstract class BaseService {
  protected abstract _BASE_URL: string;

  protected async handleApiCall<T>(
    apiCall: () => Promise<{ data: T }>
  ): Promise<T> {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error: any) {
      const errorResponse: IApiErrorResponse = {
        statusCode: error?.response?.status || 500,
        timestamp: error?.response?.data?.timestamp || new Date().toISOString(),
        path: error?.response?.data?.path || error?.config?.url || '',
        message: error?.response?.data?.message || error?.message || 'Unknown error'
      };

      // Extract field errors for validation errors (422)
      let fieldErrors: Record<string, string[]> | undefined;
      if (isValidationError(error)) {
        fieldErrors = extractFieldErrors(error);
      }

      // Throw custom ApiError instead of returning error object
      throw new ApiError(errorResponse, fieldErrors);
    }
  }
}

