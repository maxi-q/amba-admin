import { instance } from '@services/config/axios';
import type { ICreateRoomRequest, ICreateRoomResponse, IGetRoomByIdResponse, IGetRoomResponse, IRotateSecretKeyResponse, IUpdateRoomsRequest, IUpdateRoomsResponse } from './rooms.types';
import { getContentType } from '@services/config/axios.helper';


class RoomsService {
  private _BASE_URL = 'rooms';

  async getRooms() {
    return instance.get<IGetRoomResponse[]>(`${this._BASE_URL}/my`, { headers: getContentType() });
  }

  async createRooms(data: ICreateRoomRequest) {
    return instance.post<ICreateRoomResponse>(`${this._BASE_URL}`, data, { headers: getContentType() });
  }

  async updateRooms(data: IUpdateRoomsRequest, id: string) {
    return instance.patch<IUpdateRoomsResponse>(`${this._BASE_URL}/${id}`, data, { headers: getContentType() });
  }

  async getRoomById(id: string) {
    return instance.get<IGetRoomByIdResponse>(`${this._BASE_URL}/${id}`, { headers: getContentType() });
  }

  async rotateSecretKey(id: string) {
    return instance.put<IRotateSecretKeyResponse>(`${this._BASE_URL}/${id}/rotateSecretKey`, undefined, { headers: getContentType() });
  }
}

const roomsService = new RoomsService();

export default roomsService;