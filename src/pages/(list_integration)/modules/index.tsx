import type { ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
} from "@mui/material";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { Loader } from "@/components/Loader";
import { useState } from "react";

interface RoomBoxProps {
  children: ReactNode | ReactNode[];
}

const RoomBox = ({ children }: RoomBoxProps) => {
  const { slug } = useParams();
  const [showCopyNotification, setShowCopyNotification] = useState(false);

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
    }
  };

  const handleCloseNotification = () => {
    setShowCopyNotification(false);
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
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Список комнат
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {roomData?.name}
          </Typography>
        </Breadcrumbs>
        <MuiLink variant="body2" underline="always" color="inherit" onClick={handleCopyRoomId}>
          Скопировать ID комнаты
        </MuiLink>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5, mb: 4 }}>
        <NavLink
          to="setting"
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <Button
              fullWidth
              variant="outlined"
              disabled={isActive}
            >
              Настройки
            </Button>
          )}
        </NavLink>
        <NavLink
          to="sprints"
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <Button
              fullWidth
              variant="outlined"
              disabled={isActive}
            >
              Спринты
            </Button>
          )}
        </NavLink>
        <NavLink
          to="events"
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <Button
              fullWidth
              variant="outlined"
              disabled={isActive}
            >
              События
            </Button>
          )}
        </NavLink>
        <Box>
          {/* Пустой элемент для выравнивания */}
        </Box>
      </Box>

      {children}

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
    </Box>
  );
};

export default RoomBox;
