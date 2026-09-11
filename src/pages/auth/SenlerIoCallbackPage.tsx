import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, PageLoader } from '@senler/ui';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { clearSenlerRuAuthContext } from '@/helpers';
import { useAuthStore } from '@/store';
import {
  exchangeSenlerIoCode,
  prepareSenlerIoLogin,
  readSenlerIoLoginCode,
  SENLER_IO_START_URL,
  type SenlerIoLoginResponse,
} from '@/services/auth/senler-io-auth';

export const SenlerIoCallbackPage = () => {
  const [code] = useState(() => readSenlerIoLoginCode(window.location.hash));
  const [error, setError] = useState<string | null>(null);
  const exchange = useRef<Promise<SenlerIoLoginResponse> | null>(null);
  const login = useAuthStore(state => state.login);
  const client = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    // Preserve React Router's history state, but remove the one-time code before
    // any request. It is kept only in memory while the exchange is running.
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    if (!code) return;

    let active = true;
    // StrictMode replays effects. Both runs subscribe to the same request.
    exchange.current ??= exchangeSenlerIoCode(code);
    void exchange.current.then(async (response) => {
      if (!active) return;
      if (!response.token || response.project?.provider !== 'SENLER_IO') {
        throw new Error('Invalid OAuth response');
      }
      await client.cancelQueries();
      if (!active) return;
      client.clear();
      clearSenlerRuAuthContext();
      login(response.token, 'SENLER_IO');
      client.setQueryData([QueryKeys.PROJECT], response.project);
      navigate('/', { replace: true });
    }).catch(() => {
      if (active) setError('Не удалось завершить вход. Код мог истечь или уже использоваться. Начните вход заново.');
    });

    return () => { active = false; };
  }, [code, client, login, navigate]);

  const message = !code
    ? 'Код входа отсутствует или недействителен. Начните вход через Senler.io заново.'
    : error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-2">
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Вход через Senler.io</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? <>
            <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert>
            <Button asChild className="w-full" size="lg">
              <a href={SENLER_IO_START_URL} target="_top" onClick={prepareSenlerIoLogin}>Войти заново</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Вернуться</Link>
            </Button>
          </> : <PageLoader label="Подключаем проект…" />}
        </CardContent>
      </Card>
    </div>
  );
};
