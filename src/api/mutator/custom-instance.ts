import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import { getApiBaseUrl } from '@/constants';
import { useAuthStore } from '@/store';
import { ApiError, type IApiErrorResponse } from '@/types';

type CustomInstanceMock = (
  config: AxiosRequestConfig,
) => unknown | Promise<unknown>;

let customInstanceMock: CustomInstanceMock | null = null;

export const setCustomInstanceMock = (mock: CustomInstanceMock | null) => {
  customInstanceMock = mock;
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
});

const createApiError = (error: AxiosError) => {
  const responseData = error.response?.data as Partial<IApiErrorResponse> | undefined;
  const statusCode = error.response?.status ?? 500;
  const message = responseData?.message ?? {
    message: error.message,
    error: error.name,
    statusCode,
  };
  const errorResponse = {
    statusCode,
    timestamp: responseData?.timestamp ?? new Date().toISOString(),
    path: responseData?.path ?? error.config?.url ?? '',
    message,
  } as IApiErrorResponse;
  const fieldErrors =
    statusCode === 422 && typeof message === 'object' && !('message' in message)
      ? (message as Record<string, string[]>)
      : undefined;

  return new ApiError(errorResponse, fieldErrors);
};

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig & { skipAuth?: boolean },
): Promise<T> => {
  const { skipAuth = false, ...requestOptions } = options ?? {};
  const token = skipAuth ? null : localStorage.getItem('token');

  const requestConfig: AxiosRequestConfig = {
    ...config,
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
      ...requestOptions.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (customInstanceMock) {
    return customInstanceMock(requestConfig) as Promise<T>;
  }

  try {
    const response = await axiosInstance.request<T>(requestConfig);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // A response from an old session must not log out a newly selected project.
      if (error.response?.status === 401 && token &&
          localStorage.getItem('authProvider') === 'SENLER_IO' &&
          localStorage.getItem('token') === token) {
        useAuthStore.getState().logout();
      }
      throw createApiError(error);
    }

    throw error;
  }
};
