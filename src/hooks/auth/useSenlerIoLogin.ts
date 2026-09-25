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
  senlerIoSessionRequiresNewLaunch,
} from '@/services/auth/senler-io-session';
import { senlerIoLaunch } from '@/services/auth/senler-io-launch';
import { useAuthStore } from '@/store';
import { ApiError } from '@/types';

export function useSenlerIoLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(canResumeSenlerIoSession);
  const [isBlocked, setIsBlocked] = useState(senlerIoSessionRequiresNewLaunch);
  const [error, setError] = useState<string | null>(() => senlerIoSessionRequiresNewLaunch()
    ? 'Для повторного входа закройте плагин и откройте его заново в Senler.io.' : null);
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
    login(response.token, 'SENLER_IO');
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
          throw new Error('Сессия изменилась. Закройте плагин и откройте его заново.');
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
          // A lost response may already have consumed the nonce. Do not retry
          // the same launch or send the user through a futile OAuth flow.
          setIsBlocked(true);
          setError('Не удалось восстановить вход. Закройте плагин и откройте его заново.');
        }
      } finally {
        if (active) setIsRestoring(false);
      }
    })();
    return () => { active = false; };
  }, [acceptSession]);

  const start = async () => {
    if (attempt.current || isRestoring || isBlocked) return;
    setError(null);
    setIsPending(true);
    try {
      if (senlerIoLaunch.embedded && !senlerIoLaunch.code) {
        throw new Error('Код запуска отсутствует. Закройте плагин и откройте его заново в Senler.io.');
      }
      const popup = openSenlerIoPopup(senlerIoLaunch.code ?? undefined);
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

  return { start, isPending: isPending || isRestoring, isRestoring, isBlocked, error };
}
