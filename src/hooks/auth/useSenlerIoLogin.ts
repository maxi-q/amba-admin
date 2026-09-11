import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { clearSenlerRuAuthContext } from '@/helpers';
import { exchangeSenlerIoCode, openSenlerIoPopup } from '@/services/auth/senler-io-auth';
import { senlerIoLaunch } from '@/services/auth/senler-io-launch';
import { useAuthStore } from '@/store';

export function useSenlerIoLogin() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<ReturnType<typeof openSenlerIoPopup> | null>(null);
  const mounted = useRef(false);
  const client = useQueryClient();
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const location = useLocation();

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

  const start = async () => {
    if (attempt.current) return;
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
      if (!response.token || response.project?.provider !== 'SENLER_IO') throw new Error('Некорректный ответ авторизации.');
      if (!mounted.current) return;
      await client.cancelQueries();
      if (!mounted.current) return;
      client.clear();
      clearSenlerRuAuthContext();
      login(response.token, 'SENLER_IO');
      client.setQueryData([QueryKeys.PROJECT], response.project);
      navigate('/', { replace: true });
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'Не удалось завершить вход через Senler.io.');
    } finally {
      attempt.current = null;
      if (mounted.current) setIsPending(false);
    }
  };

  return { start, isPending, error };
}
