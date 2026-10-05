import { customInstance } from '@/api/mutator/custom-instance';
import { getApiEndpointUrl } from '@/constants';
import type { IGetProjectResponse } from '@/services/projects/projects.types';

export interface SenlerIoLoginResponse {
  token: string;
  refreshToken?: string;
  project: IGetProjectResponse & { provider: 'SENLER_IO'; senlerIoProjectId: string };
}

export const SENLER_IO_START_URL = getApiEndpointUrl('auth/senler-io/start');

export function openSenlerIoPopup(launchCode?: string) {
  const apiOrigin = new URL(SENLER_IO_START_URL, window.location.href).origin;
  const target = `senler-io-${crypto.randomUUID()}`;
  const popup = window.open('', target, 'popup,width=600,height=700');
  if (!popup) throw new Error('Разрешите всплывающие окна для входа через Senler.io.');

  let cancel = () => {};
  const result = new Promise<string>((resolve, reject) => {
    let completed = false;
    const startedAt = Date.now();
    const finish = (code?: string, error?: Error) => {
      if (completed) return;
      completed = true;
      window.removeEventListener('message', receive);
      clearInterval(timer);
      if (error) {
        popup.close();
        reject(error);
      } else {
        resolve(code!);
      }
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== apiOrigin || event.source !== popup) return;
      const data = event.data;
      if (!data || data.type !== 'SenlerIoOAuthResult') return;
      const code = typeof data.code === 'string' && /^[A-Za-z0-9_-]{43}$/.test(data.code) ? data.code : undefined;
      const error = typeof data.error === 'string' && data.error ? new Error(data.error) : undefined;
      if (!code && !error) return;
      popup.postMessage({ type: 'SenlerIoOAuthReceived' }, apiOrigin);
      finish(code, error);
    };
    window.addEventListener('message', receive);
    const timer = setInterval(() => {
      if (popup.closed) finish(undefined, new Error('Окно авторизации закрыто. Повторите вход через Senler.io.'));
      else if (Date.now() - startedAt > 10 * 60 * 1000) finish(undefined, new Error('Время входа истекло. Повторите вход через Senler.io.'));
    }, 500);
    cancel = () => finish(undefined, new Error('Вход отменён.'));

    // A form targets the popup, keeping the original iframe in place and the
    // signed launch code out of the popup URL and Referer headers.
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = SENLER_IO_START_URL;
    form.target = target;
    form.hidden = true;
    if (launchCode !== undefined) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'launchCode';
      input.value = launchCode;
      form.append(input);
    }
    try {
      document.body.append(form);
      form.submit();
    } catch {
      finish(undefined, new Error('Не удалось открыть авторизацию Senler.io.'));
    } finally {
      form.remove();
    }
  });
  return { result, cancel };
}

// The code is consumed once. Never retry or attach a saved project JWT: an
// expired JWT would be rejected by the backend before reaching this endpoint.
export const exchangeSenlerIoCode = (code: string) =>
  customInstance<SenlerIoLoginResponse>(
    { url: '/api/auth/senler-io/exchange', method: 'POST', data: { code } },
    { skipAuth: true },
  );
