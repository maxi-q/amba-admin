import { instance } from '@services/config/axios';
import type { IGetProjectsResponse } from './promocodes.types';


class ProjectsService {
  private _BASE_URL = 'project';

  async getProjects() {
    return instance.get<IGetProjectsResponse>(`${this._BASE_URL}/my`);
  }
}

const projectsService = new ProjectsService();

export default projectsService;