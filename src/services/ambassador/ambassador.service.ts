import { instance } from '@services/config/axios';
import type { IGetAmbassadorsResponse, IGetAmbassadorsRequest, IApproveEventApplicationsRequest, IApproveEventApplicationsResponse, IApproveRoomApplicationsRequest, IApproveRoomApplicationsResponse, IGetEventApplicationsRequest, IGetEventApplicationsResponse, IGetRoomApplicationsRequest, IGetRoomApplicationsResponse } from './ambassador.types';
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
    return instance.post<IApproveRoomApplicationsResponse>(`${this._BASE_URL}/room-applications/approve`, data, { headers: getContentType() });
  }

  async getEventApplications(data: IGetEventApplicationsRequest) {
    return instance.get<IGetEventApplicationsResponse>(`${this._BASE_URL}/event-applications`, { params: data, headers: getContentType() });
  }

  async approveEventApplications(data: IApproveEventApplicationsRequest) {
    return instance.post<IApproveEventApplicationsResponse>(`${this._BASE_URL}/event-applications/approve`, data, { headers: getContentType() });
  }
}

const ambassadorService = new AmbassadorService();

export default ambassadorService;