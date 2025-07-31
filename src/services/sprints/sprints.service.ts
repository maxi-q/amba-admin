import { instance } from '@services/config/axios';
import type { ICreateSprintRequest, ICreateSprintResponse, IPatchSprintsRequest, IPatchSprintsResponse } from './sprints.types';
import { getContentType } from '@services/config/axios.helper';


class SprintsService {
  private _BASE_URL = 'sprints';

  async patchSprints(data: IPatchSprintsRequest, roomId: string) {
    return instance.patch<IPatchSprintsResponse>(`${this._BASE_URL}`, data, { params: { roomId }, headers: getContentType() });
  }

  async createSprint(data: ICreateSprintRequest) {
    return instance.post<ICreateSprintResponse>(`${this._BASE_URL}`, data, { headers: getContentType() });
  }
}

const sprintsService = new SprintsService();

export default sprintsService;