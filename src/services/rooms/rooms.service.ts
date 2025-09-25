import { instance } from '@services/config/axios';
import type { 
  ICreateRoomRequest, 
  ICreateRoomResponse, 
  IGetRoomByIdResponse, 
  IGetRoomResponse, 
  IRotateSecretKeyResponse, 
  IUpdateRoomsRequest, 
  IUpdateRoomsResponse,
  IServiceResponse,
  IApiErrorResponse
} from './rooms.types';
import { 
  getContentType, 
  isValidationError, 
  extractFieldErrors 
} from '@services/config/axios.helper';


class RoomsService {
  private _BASE_URL = 'rooms';

  private async handleApiCall<T>(
    apiCall: () => Promise<{ data: T }>
  ): Promise<IServiceResponse<T>> {
    try {
      const response = await apiCall();
      return { data: response.data };
    } catch (error: any) {
      const errorResponse: IApiErrorResponse = {
        statusCode: error?.response?.status || 500,
        timestamp: error?.response?.data?.timestamp || new Date().toISOString(),
        path: error?.response?.data?.path || error?.config?.url || '',
        message: error?.response?.data?.message || error?.message || 'Unknown error'
      };

      const result: IServiceResponse<T> = { error: errorResponse };

      // Extract field errors for validation errors (422)
      if (isValidationError(error)) {
        result.fieldErrors = extractFieldErrors(error);
      }

      return result;
    }
  }

  async getRooms(): Promise<IServiceResponse<IGetRoomResponse[]>> {
    return this.handleApiCall(() => 
      instance.get<IGetRoomResponse[]>(`${this._BASE_URL}/my`, { headers: getContentType() })
    );
  }

  async createRooms(data: ICreateRoomRequest): Promise<IServiceResponse<ICreateRoomResponse>> {
    return this.handleApiCall(() => 
      instance.post<ICreateRoomResponse>(`${this._BASE_URL}`, data, { headers: getContentType() })
    );
  }

  async updateRooms(data: IUpdateRoomsRequest, id: string): Promise<IServiceResponse<IUpdateRoomsResponse>> {
    return this.handleApiCall(() => 
      instance.patch<IUpdateRoomsResponse>(`${this._BASE_URL}/${id}`, data, { headers: getContentType() })
    );
  }

  async getRoomById(id: string): Promise<IServiceResponse<IGetRoomByIdResponse>> {
    return this.handleApiCall(() => 
      instance.get<IGetRoomByIdResponse>(`${this._BASE_URL}/${id}`, { headers: getContentType() })
    );
  }

  async rotateSecretKey(id: string): Promise<IServiceResponse<IRotateSecretKeyResponse>> {
    return this.handleApiCall(() => 
      instance.put<IRotateSecretKeyResponse>(`${this._BASE_URL}/${id}/rotateSecretKey`, undefined, { headers: getContentType() })
    );
  }
}

const roomsService = new RoomsService();

export default roomsService;