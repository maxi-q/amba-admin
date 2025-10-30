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
import {
  getContentType,
  isValidationError,
  extractFieldErrors
} from '@services/config/axios.helper';
import { ApiError, type IApiErrorResponse } from '@/types';


class AuthService {
  private _BASE_URL = 'auth';

  private async handleApiCall<T>(
    apiCall: () => Promise<{ data: T }>
  ): Promise<T> {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error: any) {
      const errorResponse: IApiErrorResponse = {
        statusCode: error?.response?.status || 500,
        timestamp: error?.response?.data?.timestamp || new Date().toISOString(),
        path: error?.response?.data?.path || error?.config?.url || '',
        message: error?.response?.data?.message || error?.message || 'Unknown error'
      };

      // Extract field errors for validation errors (422)
      let fieldErrors: Record<string, string[]> | undefined;
      if (isValidationError(error)) {
        fieldErrors = extractFieldErrors(error);
      }

      // Throw custom ApiError instead of returning error object
      throw new ApiError(errorResponse, fieldErrors);
    }
  }

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