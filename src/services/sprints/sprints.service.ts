import { instance } from '@services/config/axios';
import type { 
  ICreateSprintRequest, 
  ICreateSprintResponse, 
  IGetSprintsRequest, 
  IGetSprintsResponse, 
  IPatchSprintsRequest, 
  IPatchSprintsResponse,
} from './sprints.types';
import { getContentType } from '@services/config/axios.helper';
import { BaseService } from '@services/config/base.service';


class SprintsService extends BaseService {
  protected _BASE_URL = 'sprints';

  async getSprints(data: IGetSprintsRequest, roomId: string): Promise<IGetSprintsResponse> {
    return this.handleApiCall(() => 
      instance.get<IGetSprintsResponse>(`${this._BASE_URL}/${roomId}`, { params: data, headers: getContentType() })
    );
  }

  async patchSprints(data: IPatchSprintsRequest, sprintId: string): Promise<IPatchSprintsResponse> {
    return this.handleApiCall(() => 
      instance.patch<IPatchSprintsResponse>(`${this._BASE_URL}/${sprintId}`, data, { headers: getContentType() })
    );
  }

  async createSprint(data: ICreateSprintRequest): Promise<ICreateSprintResponse> {
    return this.handleApiCall(() => 
      instance.post<ICreateSprintResponse>(`${this._BASE_URL}`, data, { headers: getContentType() })
    );
  }
}

const sprintsService = new SprintsService();

export default sprintsService;