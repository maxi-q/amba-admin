import { instance } from '@services/config/axios';
import type { ICreateSprintRequest, ICreateSprintResponse, IGetSprintsResponse } from './sprints.types';


class SprintsService {
  private _BASE_URL = 'sprint';

  async getSprints(roomId: string) {
    return instance.get<IGetSprintsResponse>(`${this._BASE_URL}/my`, { params: { roomId } });
  }

  async createSprint(data: ICreateSprintRequest) {
    return instance.post<ICreateSprintResponse>(`${this._BASE_URL}`, data);
  }
}

const sprintsService = new SprintsService();

export default sprintsService;