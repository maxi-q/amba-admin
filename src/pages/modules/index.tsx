import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";

interface RoomBoxProps {
  roomName: string;
  children: ReactNode | ReactNode[];
}

const RoomBox = ({ roomName, children }: RoomBoxProps) => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Список комнат
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {roomName}
          </Typography>
        </Breadcrumbs>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          ID: 56
        </Typography>
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
    </Container>
  );
};

export default RoomBox;
