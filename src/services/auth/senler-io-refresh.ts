import axios from 'axios';
import { getApiBaseUrl } from '@/constants';
import { useAuthStore } from '@/store';
import type { SenlerIoLoginResponse } from './senler-io-auth';
import { getSenlerIoRefreshSession, SENLER_IO_REFRESH_STORAGE_KEY } from './senler-io-credentials';

const http = axios.create({ baseURL: getApiBaseUrl(), timeout: 75000 });
let pending: { sessionId: string; promise: Promise<string> } | undefined;

function expiresSoon(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now() + 60000;
  } catch {
    return true;
  }
}

export async function refreshSenlerIoToken(token: string, sessionId: string, force = false): Promise<string> {
  if (!force && !expiresSoon(token)) return token;
  if (pending?.sessionId === sessionId) return pending.promise;

  const refresh = async () => {
    const session = getSenlerIoRefreshSession();
    const currentToken = localStorage.getItem('token');
    if (session?.id !== sessionId || !currentToken) throw new Error('Сессия изменилась. Повторите вход.');
    // A concurrent request or tab already refreshed this same login.
    if (currentToken !== token) return currentToken;
    try {
      const { data } = await http.post<SenlerIoLoginResponse>('/api/auth/senler-io/refresh', {
        refreshToken: session.refreshToken,
      });
      if (!data.token || !data.refreshToken || data.project?.provider !== 'SENLER_IO') {
        throw new Error('Некорректный ответ обновления сессии. Повторите вход.');
      }
      const latest = getSenlerIoRefreshSession();
      if (latest?.id !== sessionId || latest.refreshToken !== session.refreshToken || localStorage.getItem('token') !== token) {
        throw new Error('Сессия изменилась во время обновления. Повторите вход.');
      }
      localStorage.setItem(SENLER_IO_REFRESH_STORAGE_KEY, JSON.stringify({ ...session, refreshToken: data.refreshToken }));
      // During embedded resume this must not mark the app authenticated yet.
      useAuthStore.getState().setToken(data.token);
      return data.token;
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0) &&
          getSenlerIoRefreshSession()?.id === sessionId && localStorage.getItem('token') === token) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  };

  // Serialize rotating credentials across tabs where Web Locks are available.
  // The shared promise covers concurrent requests in this tab on every browser.
  const promise = (typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('senler-io-session-refresh', refresh)
    : refresh());
  pending = { sessionId, promise };
  try {
    return await promise;
  } finally {
    if (pending?.promise === promise) pending = undefined;
  }
}
