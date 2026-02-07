import { instance } from '@services/config/axios';
import { getContentType } from '@services/config/axios.helper';
import type { ICreateCreativeTaskRequest, ICreateCreativeTaskResponse, IGetCreativeTaskResponse, IGetRoomCreativeTasksRequest, IGetRoomCreativeTasksResponse, IGetSubmissionResponse, IGetSubmissionsRequest, IGetSubmissionsResponse, IUpdateCreativeTaskRequest, IUpdateCreativeTaskResponse } from './creativetasks.types';


class CreativeTasksService {
  private _BASE_URL = 'creative-tasks';

  async getRoomCreativeTasks(roomId: string, data: IGetRoomCreativeTasksRequest) {
    return instance.get<IGetRoomCreativeTasksResponse>(`${this._BASE_URL}/room/${roomId}`, { params: data, headers: getContentType() });
  }

  async getCreativeTask(id: string) {
    return instance.get<IGetCreativeTaskResponse>(`${this._BASE_URL}/${id}`, { headers: getContentType() });
  }

  async updateCreativeTask(id: string, data: IUpdateCreativeTaskRequest) {
    return instance.patch<IUpdateCreativeTaskResponse>(`${this._BASE_URL}/${id}`, data, { headers: getContentType() });
  }

  async createCreativeTask(data: ICreateCreativeTaskRequest) {
    return instance.post<ICreateCreativeTaskResponse>(`${this._BASE_URL}`, data, { headers: getContentType() });
  }

  async getSubmissions(taskId: string, data: IGetSubmissionsRequest) {
    return instance.get<IGetSubmissionsResponse>(`${this._BASE_URL}/${taskId}/submissions`, { params: data, headers: getContentType() });
  }

  async getSubmission(submissionId: string) {
    return instance.get<IGetSubmissionResponse>(`${this._BASE_URL}/submissions/${submissionId}`, { headers: getContentType() });
  }
}

const creativeTaskService = new CreativeTasksService();

export default creativeTaskService;