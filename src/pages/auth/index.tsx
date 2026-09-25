import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle } from "@senler/ui";
import { getUrlParams } from "@helpers/index";
import { useMessage } from "@/messages/messageProvider";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRegisterProjectWithAuth } from "@/hooks/auth/useRegisterProjectWithAuth";
import { useAuthStore } from "@store/index";
import { MessageTypes } from "@/messages/types/messages.enum";
import { getApiEndpointUrl } from "@/constants";
import { useSenlerIoLogin } from '@/hooks/auth/useSenlerIoLogin';

export const AuthPage = () => {
  const { sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId } = getUrlParams();
  const hasSenlerRuParams = Boolean(sign && senlerGroupId && senlerUserId && context && senlerChannelTypeId);
  const { message } = useMessage();
  const { auth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const authPopup = useRef<Window | null>(null);

  const authMutation = useAuth();
  const registerProjectWithAuthMutation = useRegisterProjectWithAuth();
  const senlerIoLogin = useSenlerIoLogin();

  useEffect(() => {
    if (!message) return;

    if (message.type === MessageTypes.AmoAuthCode) {
      authPopup.current = null;
      const { code } = message.payload;
      handleAuthCode(code);
    } else if (message.type === MessageTypes.AmoAuthCodeError) {
      authPopup.current = null;
      const { error } = message.payload;
      setError(error);
      setIsLoading(false);
    }
  }, [message]);

  const handleAuthCode = (code: string) => {
    if (!sign || !senlerGroupId || !senlerUserId || !context || !senlerChannelTypeId) {
      setError("Данные авторизации не получены");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    registerProjectWithAuthMutation.mutate({
      registerData: {
        groupId: Number(senlerGroupId),
        code: code,
      },
      authData: {
        userId: senlerUserId,
        groupId: Number(senlerGroupId),
        context,
        sign,
      }
    }, {
      onError: (error) => {
        setError(error instanceof Error ? error.message : "Ошибка регистрации проекта");
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    if (sign && senlerGroupId && senlerUserId && context && senlerChannelTypeId && !auth) {
      setIsLoading(true);
      setError(null);

      authMutation.mutate({
        userId: senlerUserId,
        groupId: Number(senlerGroupId),
        context,
        sign,
      });
    }
  }, [sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId, auth]);

  useEffect(() => {
    if (authMutation.isSuccess || authMutation.isError) {
      setIsLoading(false);
    }
  }, [authMutation.isSuccess, authMutation.isError]);

  useEffect(() => {
    if (registerProjectWithAuthMutation.isSuccess || registerProjectWithAuthMutation.isError) {
      setIsLoading(false);
    }
  }, [registerProjectWithAuthMutation.isSuccess, registerProjectWithAuthMutation.isError]);

  useEffect(() => {
    if (auth) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [auth, location, navigate]);

  useEffect(() => {
    if (!isLoading || !authPopup.current) return;
    const timer = window.setInterval(() => {
      if (authPopup.current?.closed) {
        authPopup.current = null;
        setError("Окно авторизации закрыто. Попробуйте войти ещё раз.");
        setIsLoading(false);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  const openAuthPopup = () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${getApiEndpointUrl('auth/start')}?groupId=${Number(senlerGroupId)}`;
      authPopup.current = window.open(url, '_blank', 'width=600,height=700');
      if (!authPopup.current) {
        setError("Браузер заблокировал окно авторизации. Разрешите всплывающие окна и повторите вход.");
        setIsLoading(false);
      }
    } catch {
      authPopup.current = null;
      setError("Ошибка открытия popup");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-2">
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Авторизация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {(error || senlerIoLogin.error) && (
          <Alert variant="destructive" className="text-left">
            <AlertDescription>{senlerIoLogin.error || error}</AlertDescription>
          </Alert>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {senlerIoLogin.isRestoring ? "Восстанавливаем вход…" : isLoading || senlerIoLogin.isPending
            ? "Выполняется авторизация…"
            : "Для доступа к системе необходимо авторизоваться через Senler"
          }
        </p>

        {!isLoading && !senlerIoLogin.isRestoring && !auth && !authMutation.isPending && !registerProjectWithAuthMutation.isPending && (
          <div className="space-y-3">
            {hasSenlerRuParams ? (
              <Button type="button" className="w-full" size="lg" onClick={openAuthPopup} disabled={senlerIoLogin.isPending}>
                Войти через Senler.ru
              </Button>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Для входа через Senler.ru откройте амбассадорку из кабинета Senler.ru.
              </p>
            )}
            <Button type="button" className="w-full" size="lg" variant={hasSenlerRuParams ? 'outline' : 'default'}
              onClick={() => void senlerIoLogin.start()} disabled={senlerIoLogin.isPending || senlerIoLogin.isBlocked}>
              {senlerIoLogin.isPending ? 'Ожидание авторизации…' : 'Войти через Senler.io'}
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};
