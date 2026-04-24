import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle } from "@senler/ui";
import { getUrlParams } from "@helpers/index";
import { useMessage } from "@/messages/messageProvider";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRegisterProjectWithAuth } from "@/hooks/auth/useRegisterProjectWithAuth";
import { useAuthStore } from "@store/index";
import authService from "@services/auth/auth.service";
import { MessageTypes } from "@/messages/types/messages.enum";

export const AuthPage = () => {
  const { sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId } = getUrlParams();
  const { message } = useMessage();
  const { auth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authMutation = useAuth();
  const registerProjectWithAuthMutation = useRegisterProjectWithAuth();

  useEffect(() => {
    if (!message) return;

    if (message.type === MessageTypes.AmoAuthCode) {
      const { code } = message.payload;
      handleAuthCode(code);
    } else if (message.type === MessageTypes.AmoAuthCodeError) {
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
      onError: (error: { message?: string }) => {
        if (error?.message === 'PROJECT_ALREADY_EXISTS') {
          authMutation.mutate({
            userId: senlerUserId,
            groupId: Number(senlerGroupId),
            context,
            sign,
          });
        } else {
          setError("Ошибка регистрации проекта");
          setIsLoading(false);
        }
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

  const openAuthPopup = () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = authService.start(Number(senlerGroupId))
      window.open(url, '_blank', 'width=600,height=700');
    } catch {
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
        {error && (
          <Alert variant="destructive" className="text-left">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {isLoading
            ? "Выполняется авторизация…"
            : "Для доступа к системе необходимо авторизоваться через Senler"
          }
        </p>

        {!isLoading && !auth && !authMutation.isPending && !registerProjectWithAuthMutation.isPending && (
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={openAuthPopup}
            disabled={authMutation.isPending || registerProjectWithAuthMutation.isPending}
          >
            Войти
          </Button>
        )}
        </CardContent>
      </Card>
    </div>
  );
};
