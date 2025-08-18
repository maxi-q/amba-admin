import { instance } from '@services/config/axios';
import type { IGetProjectResponse } from './projects.types';
import { getContentType } from '@services/config/axios.helper';


class ProjectsService {
  private _BASE_URL = 'projects';

  async getProject() {
    return instance.get<IGetProjectResponse>(`${this._BASE_URL}/my`, { headers: getContentType() });
  }
}

const projectsService = new ProjectsService();

export default projectsService;