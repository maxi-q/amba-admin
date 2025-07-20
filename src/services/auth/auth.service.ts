import { instance } from '@services/config/axios';
import type {
  IAuthByTokenRequest,
  ILoginRequest,
  ILoginResponse,
  IRegisterProjectRequest,
  IRegisterProjectResponse,
  IAuthByTokenResponse
} from './user.types';


class AuthService {
  private _BASE_URL = '/auth';

  async auth(data: ILoginRequest) {
    return instance.post<ILoginResponse>(`${this._BASE_URL}/login`, data);
  }

  async registerProject(data: IRegisterProjectRequest) {
    return instance.post<IRegisterProjectResponse>(`${this._BASE_URL}/registerProject`, data);
  }

  async authByToken(data: IAuthByTokenRequest) {
    return instance.get<IAuthByTokenResponse>(`${this._BASE_URL}/auth`, {params: data});
  }


}

const authService = new AuthService();

export default authService;