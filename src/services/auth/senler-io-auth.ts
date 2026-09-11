import { customInstance } from '@/api/mutator/custom-instance';
import { getApiEndpointUrl } from '@/constants';
import { clearSenlerRuAuthContext } from '@/helpers';
import type { IGetProjectResponse } from '@/services/projects/projects.types';

export interface SenlerIoLoginResponse {
  token: string;
  project: IGetProjectResponse & { provider: 'SENLER_IO'; senlerIoProjectId: string };
}

export const SENLER_IO_START_URL = getApiEndpointUrl('auth/senler-io/start');

export const prepareSenlerIoLogin = () => {
  clearSenlerRuAuthContext();
};

export const readSenlerIoLoginCode = (hash: string) => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('code');
  return params.get('provider') === 'SENLER_IO' && code && /^[A-Za-z0-9_-]{43}$/.test(code)
    ? code
    : null;
};

// The code is consumed once. Never retry or attach a saved project JWT: an
// expired JWT would be rejected by the backend before reaching this endpoint.
export const exchangeSenlerIoCode = (code: string) =>
  customInstance<SenlerIoLoginResponse>(
    { url: '/api/auth/senler-io/exchange', method: 'POST', data: { code } },
    { skipAuth: true },
  );
