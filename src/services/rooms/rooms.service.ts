import { instance } from '@services/config/axios';
import type { 
  ICreateRoomRequest, 
  ICreateRoomResponse, 
  IGetRoomByIdResponse, 
  IGetRoomResponse, 
  IRotateSecretKeyResponse, 
  IUpdateRoomsRequest, 
  IUpdateRoomsResponse,
  IApiErrorResponse
} from './rooms.types';
import { ApiError } from './rooms.types';
import { 
  getContentType, 
  isValidationError, 
  extractFieldErrors 
} from '@services/config/axios.helper';


class RoomsService {
  private _BASE_URL = 'rooms';

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

  async getRooms(): Promise<IGetRoomResponse[]> {
    return this.handleApiCall(() => 
      instance.get<IGetRoomResponse[]>(`${this._BASE_URL}/my`, { headers: getContentType() })
    );
  }

  async createRooms(data: ICreateRoomRequest): Promise<ICreateRoomResponse> {
    return this.handleApiCall(() => 
      instance.post<ICreateRoomResponse>(`${this._BASE_URL}`, data, { headers: getContentType() })
    );
  }

  async updateRooms(data: IUpdateRoomsRequest, id: string): Promise<IUpdateRoomsResponse> {
    return this.handleApiCall(() => 
      instance.patch<IUpdateRoomsResponse>(`${this._BASE_URL}/${id}`, data, { headers: getContentType() })
    );
  }

  async getRoomById(id: string): Promise<IGetRoomByIdResponse> {
    return this.handleApiCall(() => 
      instance.get<IGetRoomByIdResponse>(`${this._BASE_URL}/${id}`, { headers: getContentType() })
    );
  }

  async rotateSecretKey(id: string): Promise<IRotateSecretKeyResponse> {
    return this.handleApiCall(() => 
      instance.put<IRotateSecretKeyResponse>(`${this._BASE_URL}/${id}/rotateSecretKey`, undefined, { headers: getContentType() })
    );
  }
}

const roomsService = new RoomsService();

export default roomsService;