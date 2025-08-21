import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRoomDataStore } from "@store/index";
import { useState } from "react";

interface RoomBoxProps {
  children: ReactNode | ReactNode[];
}

const RoomBox = ({ children }: RoomBoxProps) => {
  const { roomData } = useRoomDataStore();
  const [showCopyNotification, setShowCopyNotification] = useState(false);

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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Список комнат
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {roomData?.name}
          </Typography>
        </Breadcrumbs>
        <MuiLink variant="body2" underline="hover" color="inherit" onClick={handleCopyRoomId}>
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
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          ID комнаты скопирован в буфер обмена
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoomBox;
