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
import authService from "@services/auth/auth.service";
import { useAuthStore } from "@store/index";

const AuthPage = () => {
  const { sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId } = getUrlParams();
  const { login, auth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (sign && senlerGroupId && senlerUserId && context && senlerChannelTypeId) {
        setIsLoading(true);
        try {
          const response = await authService.auth({
            userId: senlerUserId,
            groupId: Number(senlerGroupId),
            context,
            sign,
          });

          if (response?.status === 201) {
            login(response.data.token);
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
          } else {
            // setError("Ошибка авторизации");
            logout()
          }
        } catch (error: any) {
          // Если получили 404, пробуем зарегистрировать проект
          if (error?.response?.status === 404) {
            try {
              await authService.registerProject({
                groupId: Number(senlerGroupId),
                code: context, // Предполагаем, что code = context
              });
              // После регистрации пробуем снова авторизоваться
              const retryResponse = await authService.auth({
                userId: senlerUserId,
                groupId: Number(senlerGroupId),
                context,
                sign,
              });
              if (retryResponse?.status === 201) {
                login(retryResponse.data.token);
                const from = location.state?.from?.pathname || "/";
                navigate(from, { replace: true });
              } else {
                logout();
              }
            } catch (registerError) {
              console.error('Ошибка регистрации проекта:', registerError);
              logout();
            }
          } else {
            // setError("Ошибка авторизации");
            logout()
          }
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId, login, navigate, location]);

  const openAuthPopup = () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = authService.start(Number(senlerGroupId))

      const popup = window.open(url, '_blank', 'width=600,height=700');
      if (popup) {
        let savedCode: string | null = null;
        
        const timer = setInterval(async () => {
          try {
            // Проверяем, есть ли код в URL popup окна
            if (popup.location && popup.location.href) {
              const popupUrl = new URL(popup.location.href);
              const codeParam = popupUrl.searchParams.get('code');
              
              if (codeParam && !savedCode) {
                savedCode = codeParam;
                console.log('Код получен из popup:', savedCode);
                
                // Закрываем popup после получения кода
                popup.close();
                clearInterval(timer);
                
                // Используем сохраненный код для регистрации
                try {
                  await authService.registerProject({
                    groupId: Number(senlerGroupId),
                    code: savedCode,
                  });
                  
                  // После регистрации пробуем авторизоваться
                  const response = await authService.auth({
                    userId: senlerUserId,
                    groupId: Number(senlerGroupId),
                    context,
                    sign,
                  });

                  if (response?.status === 201) {
                    login(response.data.token);
                    const from = location.state?.from?.pathname || "/";
                    navigate(from, { replace: true });
                  } else {
                    setError("Ошибка авторизации после регистрации");
                  }
                } catch (registerError: any) {
                  console.error('Ошибка регистрации проекта:', registerError);
                  if (registerError?.response?.status === 409) {
                    // Проект уже зарегистрирован, пробуем авторизоваться
                    try {
                      const authResponse = await authService.auth({
                        userId: senlerUserId,
                        groupId: Number(senlerGroupId),
                        context,
                        sign,
                      });
                      
                      if (authResponse?.status === 201) {
                        login(authResponse.data.token);
                        const from = location.state?.from?.pathname || "/";
                        navigate(from, { replace: true });
                      } else {
                        setError("Ошибка авторизации");
                      }
                    } catch (authError) {
                      console.error('Ошибка авторизации:', authError);
                      setError("Ошибка авторизации");
                    }
                  } else {
                    setError("Ошибка регистрации проекта");
                  }
                } finally {
                  setIsLoading(false);
                }
                return;
              }
            }
          } catch {
            // Игнорируем ошибки доступа к popup.location (CORS)
          }
          
          if (popup.closed) {
            clearInterval(timer);
            setIsLoading(false);
          }
        }, 500);
      }
    } catch {
      setError("Ошибка открытия popup");
      setIsLoading(false);
    }
  };

  // const handleSenlerAuthError = (error: string) => {
  //   setError(error);
  // };

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
        )}

        <Stack spacing={3}>
          <Typography variant="body1" align="center" color="text.secondary">
            {isLoading
              ? "Выполняется авторизация..."
              : "Для доступа к системе необходимо авторизоваться через Senler"
            }
          </Typography>

          {!isLoading && !auth && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={openAuthPopup}
              size="large"
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