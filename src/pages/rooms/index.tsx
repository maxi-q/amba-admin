import { useState } from "react";
import { Edit as EditIcon } from "@mui/icons-material";
import {
  Button,
  Container,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";

interface Room {
  id: number;
  name: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: "Конференция суровый маркетинг 2025" },
  ]);

  const handleCreateRoom = () => {
    const name = prompt("Введите название новой комнаты:");
    if (name) {
      setRooms((prev) => [
        ...prev,
        { id: Date.now(), name },
      ]);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", py: 6 }}>
      <Paper elevation={2} sx={{ width: "100%", borderRadius: 6, p: 4 }}>
        <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
          Список комнат
        </Typography>
        <List sx={{ mt: 4 }}>
          {rooms.map((room) => (
            <ListItem key={room.id} disablePadding sx={{ mb: 2, borderRadius: 3, boxShadow: 1, border: 1, overflow: "hidden" }}>
              <ListItemButton component={Link} to={`/rooms/${room.id}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ListItemText primary={room.name} />
                <IconButton edge="end" size="small" sx={{ ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Stack direction="row" justifyContent="flex-end" mt={8}>
          <Button
            onClick={handleCreateRoom}
            variant="createroom"
          >
            Создать комнату
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
