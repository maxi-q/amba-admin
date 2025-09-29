import { instance } from '@services/config/axios';
import type { 
  ICreateSprintRequest, 
  ICreateSprintResponse, 
  IGetSprintsRequest, 
  IGetSprintsResponse, 
  IPatchSprintsRequest, 
  IPatchSprintsResponse,
  IApiErrorResponse
} from './sprints.types';
import { ApiError } from './sprints.types';
import { 
  getContentType, 
  isValidationError, 
  extractFieldErrors 
} from '@services/config/axios.helper';


class SprintsService {
  private _BASE_URL = 'sprints';

  private async handleApiCall<T>(
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

  async getSprints(data: IGetSprintsRequest, roomId: string): Promise<IGetSprintsResponse> {
    return this.handleApiCall(() => 
      instance.get<IGetSprintsResponse>(`${this._BASE_URL}/${roomId}`, { params: data, headers: getContentType() })
    );
  }

  async patchSprints(data: IPatchSprintsRequest, sprintId: string): Promise<IPatchSprintsResponse> {
    return this.handleApiCall(() => 
      instance.patch<IPatchSprintsResponse>(`${this._BASE_URL}/${sprintId}`, data, { headers: getContentType() })
    );
  }

  async createSprint(data: ICreateSprintRequest): Promise<ICreateSprintResponse> {
    return this.handleApiCall(() => 
      instance.post<ICreateSprintResponse>(`${this._BASE_URL}`, data, { headers: getContentType() })
    );
  }
}

const sprintsService = new SprintsService();

export default sprintsService;