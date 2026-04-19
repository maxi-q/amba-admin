import { instance } from '@services/config/axios';
import type {
  ICreateRoomRequest,
  ICreateRoomResponse,
  IGetRoomAnalyticsRequest,
  IGetRoomAnalyticsResponse,
  IGetRoomByIdResponse,
  IGetRoomPromoCodeUsagesRequest,
  IGetRoomPromoCodeUsagesResponse,
  IGetRoomResponse,
  IRotateSecretKeyResponse,
  IUpdateRoomsRequest,
  IUpdateRoomsResponse,
  IRoomOrdProfile,
  ICreateRoomOrdProfileRequest,
  IUpdateRoomOrdProfileRequest,
  IGetRoomOrdContractsRequest,
  IGetRoomOrdContractsResponse,
  IRoomOrdContractItem,
  ICreateRoomOrdContractRequest,
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

  async getRoomAnalytics(id: string, data: IGetRoomAnalyticsRequest): Promise<IGetRoomAnalyticsResponse> {
    return this.handleApiCall(() =>
      instance.get<IGetRoomAnalyticsResponse>(`${this._BASE_URL}/${id}/analytics`, { params: data, headers: getContentType() })
    );
  }

  async getRoomPromoCodeUsages(id: string, data: IGetRoomPromoCodeUsagesRequest): Promise<IGetRoomPromoCodeUsagesResponse> {
    return this.handleApiCall(() =>
      instance.get<IGetRoomPromoCodeUsagesResponse>(`${this._BASE_URL}/${id}/promo-code-usages`, { params: data, headers: getContentType() })
    );
  }

  async rotateSecretKey(id: string): Promise<IRotateSecretKeyResponse> {
    return this.handleApiCall(() =>
      instance.put<IRotateSecretKeyResponse>(`${this._BASE_URL}/${id}/rotateSecretKey`, undefined, { headers: getContentType() })
    );
  }

  async createRoomOrdProfile(roomId: string, data: ICreateRoomOrdProfileRequest): Promise<IRoomOrdProfile> {
    return this.handleApiCall(() =>
      instance.post<IRoomOrdProfile>(`${this._BASE_URL}/${roomId}/ord-profile`, data, { headers: getContentType() })
    );
  }

  async updateRoomOrdProfile(roomId: string, data: IUpdateRoomOrdProfileRequest): Promise<IRoomOrdProfile> {
    return this.handleApiCall(() =>
      instance.put<IRoomOrdProfile>(`${this._BASE_URL}/${roomId}/ord-profile`, data, { headers: getContentType() })
    );
  }

  async getRoomOrdContracts(roomId: string, params?: IGetRoomOrdContractsRequest): Promise<IGetRoomOrdContractsResponse> {
    return this.handleApiCall(() =>
      instance.get<IGetRoomOrdContractsResponse>(`${this._BASE_URL}/${roomId}/ord-contracts`, {
        params,
        headers: getContentType(),
      })
    );
  }

  async getRoomOrdContractById(roomId: string, contractId: string): Promise<IRoomOrdContractItem> {
    return this.handleApiCall(() =>
      instance.get<IRoomOrdContractItem>(`${this._BASE_URL}/${roomId}/ord-contracts/${contractId}`, {
        headers: getContentType(),
      })
    );
  }

  async createRoomOrdContract(roomId: string, data: ICreateRoomOrdContractRequest): Promise<IRoomOrdContractItem> {
    return this.handleApiCall(() =>
      instance.post<IRoomOrdContractItem>(`${this._BASE_URL}/${roomId}/ord-contracts`, data, {
        headers: getContentType(),
      })
    );
  }

  async deleteRoomOrdContract(roomId: string, contractId: string): Promise<void> {
    return this.handleApiCall(() =>
      instance.delete<void>(`${this._BASE_URL}/${roomId}/ord-contracts/${contractId}`, { headers: getContentType() })
    );
  }

  // async patchBots (data: IPatchBotsRequest) {
  //   return instance.get<IPatchBotsResponse>(`${this._BASE_URL}/bots`, { headers: getContentType() });
  // }
}

const roomsService = new RoomsService();

export default roomsService;