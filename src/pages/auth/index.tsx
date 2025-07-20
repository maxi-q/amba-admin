import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import { getUrlParams } from "@helpers/index";
import authService from "@services/auth/auth.service";
import { useAuthStore } from "@store/index";
import SenlerAuthLink from "../../components/SenlerAuthLink";
import type { IOnAuthSuccess } from "../../components/SenlerAuthLink";

const AuthPage = () => {
  const { sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId } = getUrlParams();
  const { login } = useAuthStore();
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
            setError("Ошибка авторизации");
          }
        } catch {
          setError("Ошибка авторизации");
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [sign, senlerGroupId, senlerUserId, context, senlerChannelTypeId, login, navigate, location]);

  const handleSenlerAuthSuccess = async ({ code }: IOnAuthSuccess) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.registerProject({
        name: "Senler Project",
        groupId: Number(senlerGroupId) || 0,
        authorizationCode: code
      });
      
      if (response?.status === 201) {
        // После успешной регистрации проекта, нужно выполнить авторизацию
        // Предполагаем, что нужно вызвать auth метод или другой способ получения токена
        const authResponse = await authService.auth({
          userId: senlerUserId || '',
          groupId: Number(senlerGroupId) || 0,
          context: context || '',
          sign: sign || ''
        });
        
        if (authResponse?.status === 201) {
          login(authResponse.data.token);
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else {
          setError("Ошибка авторизации после регистрации");
        }
      } else {
        setError("Ошибка регистрации проекта");
      }
    } catch {
      setError("Ошибка регистрации проекта");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSenlerAuthError = (error: string) => {
    setError(error);
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
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 500, width: "100%" }}>
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
          
          {!isLoading && !sign && (
            <SenlerAuthLink
              clientId="your_client_id_here"
              redirectUri={window.location.origin + '/auth'}
              group_id={senlerGroupId || ''}
              onAuthSuccess={handleSenlerAuthSuccess}
              onAuthError={handleSenlerAuthError}
            />
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AuthPage; 