import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import { getUrlParams } from "@helpers/index";
import { useMessage } from "@/messages/messageProvider";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRegisterProjectWithAuth } from "@/hooks/auth/useRegisterProjectWithAuth";
import { useAuthStore } from "@store/index";
import authService from "@services/auth/auth.service";
import { MessageTypes } from "@/messages/types/messages.enum";

const AuthPage = () => {
  const { sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId } = getUrlParams();
  const { message } = useMessage();
  const { auth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Хуки для авторизации и регистрации
  const authMutation = useAuth();
  const registerProjectWithAuthMutation = useRegisterProjectWithAuth();

  // Обработка сообщений от popup окна с кодом авторизации
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

    // Регистрируем проект с авторизацией
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
      onError: (error: any) => {
        if (error?.message === 'PROJECT_ALREADY_EXISTS') {
          // Проект уже зарегистрирован, пытаемся авторизоваться
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

  // Автоматическая авторизация при наличии данных
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

  // Синхронизируем состояние загрузки с мутациями
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

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (auth) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [auth, location]);

  const openAuthPopup = () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = authService.start(Number(senlerGroupId))
      console.log(url)
      const popup = window.open(url, '_blank', 'width=600,height=700');
      if (popup) {
        // Код авторизации будет получен через useMessage от redirect_auth страницы
        // Никакой дополнительной логики здесь не нужно
      }
    } catch {
      setError("Ошибка открытия popup");
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, maxWidth: 500, width: "100%" }}>
        <Typography variant="h4" align="center" fontWeight={600} mb={3}>
          Авторизация
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}.

        <Stack spacing={3}>
          <Typography variant="body1" align="center" color="text.secondary">
            {isLoading
              ? "Выполняется авторизация..."
              : "Для доступа к системе необходимо авторизоваться через Senler"
            }
          </Typography>

          {!isLoading && !auth && !authMutation.isPending && !registerProjectWithAuthMutation.isPending && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={openAuthPopup}
              size="large"
              disabled={authMutation.isPending || registerProjectWithAuthMutation.isPending}
            >
              Войти
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AuthPage;