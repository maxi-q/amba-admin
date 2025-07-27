import { instance } from '@services/config/axios';
import type { ILoginRequest, ILoginResponse } from '@services/auth/user.types';
import type { ICreateRoomRequest, ICreateRoomResponse } from './rooms.types';


class RoomsService {
  private _BASE_URL = 'rooms';

  async getRooms() {
    return instance.get<any>(`${this._BASE_URL}/my`);
  }

  async createRooms(data: ICreateRoomRequest) {
    return instance.post<ICreateRoomResponse>(`${this._BASE_URL}`, data);
  }

  async updateRooms(data: ILoginRequest) {
    return instance.put<ILoginResponse>(`${this._BASE_URL}`, data);
  }
}

const roomsService = new RoomsService();

export default roomsService;