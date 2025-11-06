import { instance } from '@services/config/axios';
import type {
  IAuthByTokenRequest,
  ILoginRequest,
  ILoginResponse,
  IRegisterProjectRequest,
  IRegisterProjectResponse,
  IAuthByTokenResponse,
} from './user.types';
import { API_URL } from '@/constants';
import { getContentType } from '@services/config/axios.helper';
import { BaseService } from '@services/config/base.service';


class AuthService extends BaseService {
  protected _BASE_URL = 'auth';

  async auth(data: ILoginRequest): Promise<ILoginResponse> {
    return this.handleApiCall(() => 
      instance.post<ILoginResponse>(`${this._BASE_URL}/login`, data, { headers: getContentType() })
    );
  }

  async registerProject(data: IRegisterProjectRequest): Promise<IRegisterProjectResponse> {
    return this.handleApiCall(() => 
      instance.post<IRegisterProjectResponse>(`${this._BASE_URL}/registerProject`, data, { headers: getContentType() })
    );
  }

  async authByToken(data: IAuthByTokenRequest): Promise<IAuthByTokenResponse> {
    return this.handleApiCall(() => 
      instance.get<IAuthByTokenResponse>(`${this._BASE_URL}/auth`, {params: data, headers: getContentType()})
    );
  }

  start(groupId: number) {
    return `${API_URL}${this._BASE_URL}/start?groupId=${groupId}`;
  }
}

const authService = new AuthService();

export default authService;