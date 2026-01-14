import type { ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { Loader } from "@/components/Loader";
import { useState } from "react";
import { PRIMARY_COLOR } from "@/constants/colors";

interface RoomBoxProps {
  children: ReactNode | ReactNode[];
}

const RoomBox = ({ children }: RoomBoxProps) => {
  const { slug } = useParams();
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showCopyError, setShowCopyError] = useState(false);

  // Получаем данные комнаты по ID
  const {
    room: roomData,
    isLoading,
    isError,
    error
  } = useGetRoomById(slug || '');

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(`ID комнаты:${roomData?.id || 'Ошибка получения ID комнаты'}`);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      setShowCopyError(true);
    }
  };

  const handleCloseNotification = () => {
    setShowCopyNotification(false);
  };

  const handleCloseCopyError = () => {
    setShowCopyError(false);
  };

  // Показываем загрузку
  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  // Показываем ошибку
  if (isError) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке комнаты: {error?.message || 'Неизвестная ошибка'}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  // Показываем предупреждение, если комната не найдена
  if (!roomData) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Комната не найдена
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", minHeight: "100%" }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: "200px", 
        minHeight: "652px",
        display: "flex", 
        flexDirection: "column", 
        flexShrink: 0,
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "white"
      }}>
          <NavLink
            to="setting"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: isActive ? PRIMARY_COLOR : "white",
                  color: isActive ? "white" : "text.primary",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? PRIMARY_COLOR : "#f5f5f5"
                  }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 500 : 400}>
                  Настройки
                </Typography>
              </Box>
            )}
          </NavLink>
          <NavLink
            to="sprints"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: isActive ? PRIMARY_COLOR : "white",
                  color: isActive ? "white" : "text.primary",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? PRIMARY_COLOR : "#f5f5f5"
                  }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 500 : 400}>
                  Спринты
                </Typography>
              </Box>
            )}
          </NavLink>
          <NavLink
            to="events"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: isActive ? PRIMARY_COLOR : "white",
                  color: isActive ? "white" : "text.primary",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? PRIMARY_COLOR : "#f5f5f5"
                  }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 500 : 400}>
                  События
                </Typography>
              </Box>
            )}
          </NavLink>
          <NavLink
            to="statistics"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: isActive ? PRIMARY_COLOR : "white",
                  color: isActive ? "white" : "text.primary",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? PRIMARY_COLOR : "#f5f5f5"
                  }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 500 : 400}>
                  Статистика
                </Typography>
              </Box>
            )}
          </NavLink>
          <NavLink
            to="code"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: isActive ? PRIMARY_COLOR : "white",
                  color: isActive ? "white" : "text.primary",
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? PRIMARY_COLOR : "#f5f5f5"
                  }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 500 : 400}>
                  Код для сайта
                </Typography>
              </Box>
            )}
          </NavLink>
          <NavLink
            to="webhook"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: isActive ? PRIMARY_COLOR : "white",
                  color: isActive ? "white" : "text.primary",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? PRIMARY_COLOR : "#f5f5f5"
                  }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 500 : 400}>
                  Webhook
                </Typography>
              </Box>
            )}
          </NavLink>
        </Box>

      {/* Right side: Breadcrumbs + Content */}
      <Box sx={{ flex: 1, px: 3, py: 3 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
            <MuiLink component={Link} to="/" underline="hover" color="inherit">
              Список комнат
            </MuiLink>
            <Typography variant="body2" color="text.primary">
              {roomData?.name}
            </Typography>
          </Breadcrumbs>
          <MuiLink
            variant="body2"
            underline="always"
            color="inherit"
            onClick={handleCopyRoomId}
            sx={{
              userSelect: "none",
              cursor: "pointer"
            }}
          >
            Скопировать ID комнаты
          </MuiLink>
        </Box>

        <Box>
          {children}
        </Box>
      </Box>

      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%', cursor: 'pointer' }}>
          {/* ID комнаты скопирован в буфер обмена */}
          Скопировано
        </Alert>
      </Snackbar>

      <Snackbar
        open={showCopyError}
        autoHideDuration={5000}
        onClose={handleCloseCopyError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyError} severity="error" sx={{ width: '100%', cursor: 'pointer' }}>
          Браузер запретил копирование, но вы можете сделать это вручную: {roomData?.id}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoomBox;
