import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import { API_URL } from '@/constants';
import { ApiError, type IApiErrorResponse } from '@/types';

const getBaseUrl = () => {
  const normalizedUrl = (API_URL || '').replace(/\/+$/, '');

  return normalizedUrl.endsWith('/api')
    ? normalizedUrl.slice(0, -'/api'.length)
    : normalizedUrl;
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
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
  options?: AxiosRequestConfig,
): Promise<T> => {
  const token = localStorage.getItem('token');

  try {
    const response = await axiosInstance.request<T>({
      ...config,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...options?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw createApiError(error);
    }

    throw error;
  }
};
