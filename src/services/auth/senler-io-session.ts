import { customInstance } from '@/api/mutator/custom-instance';
import type { SenlerIoLoginResponse } from './senler-io-auth';
import { senlerIoLaunch } from './senler-io-launch';

// Capture the session that existed when this embedded page was opened. Never
// replace it with a token written by a different tab during the request.
const savedToken = senlerIoLaunch.embedded && senlerIoLaunch.code &&
  localStorage.getItem('authProvider') === 'SENLER_IO'
  ? localStorage.getItem('token')
  : null;

let handled = false;
let needsNewLaunch = false;
let request: Promise<SenlerIoLoginResponse> | undefined;

export const canResumeSenlerIoSession = () => Boolean(savedToken && !handled);
export const finishSenlerIoSessionResume = (reopenRequired = false) => {
  handled = true;
  needsNewLaunch = reopenRequired;
};
export const senlerIoSessionRequiresNewLaunch = () => needsNewLaunch;
export const isCurrentSenlerIoSession = (token: string) =>
  localStorage.getItem('authProvider') === 'SENLER_IO' && localStorage.getItem('token') === token;

export function resumeSenlerIoSession(): Promise<SenlerIoLoginResponse> {
  if (!savedToken || !senlerIoLaunch.code) throw new Error('Нет сохранённой сессии Senler.io.');
  // One request per launch, including React StrictMode and route remounts.
  // Once handled, a later logout/401 must not restore this cached response.
  request ??= customInstance<Pick<SenlerIoLoginResponse, 'project'>>(
    { url: '/api/auth/senler-io/resume', method: 'POST', data: { launchCode: senlerIoLaunch.code } },
    { skipAuth: true, headers: { Authorization: `Bearer ${savedToken}` }, timeout: 75000 },
  ).then(({ project }) => ({ project, token: savedToken }));
  return request;
}
