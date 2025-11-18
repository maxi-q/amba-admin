import { instance } from '@services/config/axios';
import type { 
  ICreateRoomRequest, 
  ICreateRoomResponse, 
  IGetRoomByIdResponse, 
  IGetRoomResponse, 
  IRotateSecretKeyResponse, 
  IUpdateRoomsRequest, 
  IUpdateRoomsResponse,
} from './rooms.types';
import { getContentType } from '@services/config/axios.helper';
import { BaseService } from '@services/config/base.service';


class RoomsService extends BaseService {
  protected _BASE_URL = 'rooms';

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

  async deleteRoomById(id: string): Promise<null> {
    return this.handleApiCall(() =>
      instance.delete<null>(`${this._BASE_URL}/${id}`, { headers: getContentType() })
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