import { customInstance } from '@/api/mutator/custom-instance';
import type { SenlerIoLoginResponse } from './senler-io-auth';
import { senlerIoLaunch } from './senler-io-launch';
import { getSenlerIoRefreshSession } from './senler-io-credentials';
import { refreshSenlerIoToken } from './senler-io-refresh';

// Capture the session that existed when this embedded page was opened. Never
// replace it with a token written by a different tab during the request.
const savedToken = senlerIoLaunch.embedded && senlerIoLaunch.code &&
  localStorage.getItem('authProvider') === 'SENLER_IO'
  ? localStorage.getItem('token')
  : null;
const savedRefreshSessionId = getSenlerIoRefreshSession()?.id;

let handled = false;
let launchConsumed = false;
let request: Promise<SenlerIoLoginResponse> | undefined;

export const canResumeSenlerIoSession = () => Boolean(savedToken && !handled);
export const finishSenlerIoSessionResume = (consumed = false) => {
  handled = true;
  launchConsumed ||= consumed;
};
export function takeSenlerIoLaunchCode(): string | undefined {
  if (launchConsumed || !senlerIoLaunch.code) return undefined;
  launchConsumed = true;
  try {
    // This only avoids sending an expired hint. Signature and project identity
    // are still verified by the backend; a new OAuth checks access independently.
    const encoded = senlerIoLaunch.code.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encoded));
    if (typeof payload.expires_at !== 'number' || payload.expires_at * 1000 <= Date.now() + 5000) return undefined;
    return senlerIoLaunch.code;
  } catch {
    return undefined;
  }
}
export const isCurrentSenlerIoSession = (token: string) =>
  localStorage.getItem('authProvider') === 'SENLER_IO' && localStorage.getItem('token') === token;

export function resumeSenlerIoSession(): Promise<SenlerIoLoginResponse> {
  if (!savedToken || !senlerIoLaunch.code) throw new Error('Нет сохранённой сессии Senler.io.');
  // One request per launch, including React StrictMode and route remounts.
  // Once handled, a later logout/401 must not restore this cached response.
  request ??= (async () => {
    if (!isCurrentSenlerIoSession(savedToken)) throw new Error('Сессия изменилась. Повторите вход.');
    const token = savedRefreshSessionId
      ? await refreshSenlerIoToken(savedToken, savedRefreshSessionId)
      : savedToken;
    const { project } = await customInstance<Pick<SenlerIoLoginResponse, 'project'>>(
      { url: '/api/auth/senler-io/resume', method: 'POST', data: { launchCode: senlerIoLaunch.code } },
      { skipAuth: true, headers: { Authorization: `Bearer ${token}` }, timeout: 75000 },
    );
    return { project, token };
  })();
  return request;
}
