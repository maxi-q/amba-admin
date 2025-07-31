import { instance } from '@services/config/axios';
import type { IGetProjectsResponse } from './promocodes.types';
import { getContentType } from '@services/config/axios.helper';


class ProjectsService {
  private _BASE_URL = 'project';

  async getProjects() {
    return instance.get<IGetProjectsResponse>(`${this._BASE_URL}/my`, { headers: getContentType() });
  }
}

const projectsService = new ProjectsService();

export default projectsService;