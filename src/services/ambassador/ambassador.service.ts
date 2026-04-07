import { instance } from '@services/config/axios';
import type { IGetAmbassadorsResponse, IGetAmbassadorsRequest, IApproveEventApplicationsRequest, IApproveEventApplicationsResponse, IApproveRoomApplicationsRequest, IApproveRoomApplicationsResponse, IGetEventApplicationsRequest, IGetEventApplicationsResponse, IGetRoomApplicationsRequest, IGetRoomApplicationsResponse, IApproveAllPendingRoomApplicationsRequest, IApproveAllPendingRoomApplicationsResponse, IGetMyOrdContractsResponse } from './ambassador.types';
import { getContentType } from '@services/config/axios.helper';


class AmbassadorService {
  private _BASE_URL = 'ambassador';

  async getAmbassadors(data: IGetAmbassadorsRequest) {
    return instance.get<IGetAmbassadorsResponse>(`${this._BASE_URL}`, { params: data, headers: getContentType() });
  }

  async getRoomApplications(data: IGetRoomApplicationsRequest) {
    return instance.get<IGetRoomApplicationsResponse>(`${this._BASE_URL}/room-applications`, { params: data, headers: getContentType() });
  }

  async approveRoomApplications(data: IApproveRoomApplicationsRequest) {
    return instance.patch<IApproveRoomApplicationsResponse>(`${this._BASE_URL}/room-applications/status`, data, { headers: getContentType() });
  }

  async getEventApplications(data: IGetEventApplicationsRequest) {
    return instance.get<IGetEventApplicationsResponse>(`${this._BASE_URL}/event-applications`, { params: data, headers: getContentType() });
  }

  async approveEventApplications(data: IApproveEventApplicationsRequest) {
    return instance.post<IApproveEventApplicationsResponse>(`${this._BASE_URL}/event-applications/approve`, data, { headers: getContentType() });
  }

  async approveAllPendingRoomApplications(data: IApproveAllPendingRoomApplicationsRequest) {
    return instance.post<IApproveAllPendingRoomApplicationsResponse>(`${this._BASE_URL}/room-applications/approve-all`, data, { headers: getContentType() });
  }

  /** GET /me/ord-contracts — ОРД-контракты текущего амбассадора */
  async getMyOrdContracts() {
    return instance.get<IGetMyOrdContractsResponse>(`${this._BASE_URL}/me/ord-contracts`, { headers: getContentType() });
  }
}

const ambassadorService = new AmbassadorService();

export default ambassadorService;