import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { clearSenlerRuAuthContext } from '@/helpers';
import { exchangeSenlerIoCode, openSenlerIoPopup, type SenlerIoLoginResponse } from '@/services/auth/senler-io-auth';
import {
  canResumeSenlerIoSession,
  finishSenlerIoSessionResume,
  isCurrentSenlerIoSession,
  resumeSenlerIoSession,
  takeSenlerIoLaunchCode,
} from '@/services/auth/senler-io-session';
import { senlerIoLaunch } from '@/services/auth/senler-io-launch';
import { useAuthStore } from '@/store';
import { ApiError } from '@/types';

export function useSenlerIoLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(canResumeSenlerIoSession);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<ReturnType<typeof openSenlerIoPopup> | null>(null);
  const mounted = useRef(false);
  const client = useQueryClient();
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const acceptSession = useCallback(async (response: SenlerIoLoginResponse, isActive: () => boolean) => {
    if (!response.token || response.project?.provider !== 'SENLER_IO') throw new Error('Некорректный ответ авторизации.');
    if (!isActive()) return false;
    await client.cancelQueries();
    if (!isActive()) return false;
    client.clear();
    clearSenlerRuAuthContext();
    client.setQueryData([QueryKeys.PROJECT], response.project);
    login(response.token, 'SENLER_IO', response.refreshToken);
    navigate('/', { replace: true });
    return true;
  }, [client, login, navigate]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      attempt.current?.cancel();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('launch_code')) return;
    params.delete('launch_code');
    navigate({ pathname: location.pathname, search: params.toString(), hash: location.hash }, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    if (!canResumeSenlerIoSession()) return;
    let active = true;
    void (async () => {
      try {
        const response = await resumeSenlerIoSession();
        if (!active) return;
        finishSenlerIoSessionResume(true);
        if (!isCurrentSenlerIoSession(response.token)) {
          throw new Error('Сессия изменилась. Повторите вход через Senler.io.');
        }
        const applied = await acceptSession(response, () => active && isCurrentSenlerIoSession(response.token));
        if (active && !applied) throw new Error('Сессия изменилась во время восстановления.');
      } catch (cause) {
        if (!active) return;
        // Auth/project/grant errors leave launchCode unused: offer explicit
        // OAuth. 404 also supports deploying this frontend before the backend.
        const canUseOAuth = cause instanceof ApiError && [401, 403, 404, 409].includes(cause.statusCode);
        finishSenlerIoSessionResume(!canUseOAuth);
        if (!canUseOAuth) {
          // A lost response may have consumed the nonce. The next click starts
          // a fresh OAuth without that hint, letting Senler verify project access.
          setError('Не удалось восстановить сессию. Войдите через Senler.io повторно.');
        }
      } finally {
        if (active) setIsRestoring(false);
      }
    })();
    return () => { active = false; };
  }, [acceptSession]);

  const start = async () => {
    if (attempt.current || isRestoring) return;
    setError(null);
    setIsPending(true);
    try {
      const popup = openSenlerIoPopup(takeSenlerIoLaunchCode());
      attempt.current = popup;
      const code = await popup.result;
      // No retries: the backend login code is single-use.
      const response = await exchangeSenlerIoCode(code);
      if (senlerIoLaunch.embedded) finishSenlerIoSessionResume(true);
      await acceptSession(response, () => mounted.current);
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'Не удалось завершить вход через Senler.io.');
    } finally {
      attempt.current = null;
      if (mounted.current) setIsPending(false);
    }
  };

  return { start, isPending: isPending || isRestoring, isRestoring, error };
}
