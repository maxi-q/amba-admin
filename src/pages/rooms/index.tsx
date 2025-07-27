import { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import roomsService from "@services/rooms/rooms.service";

interface Room {
  id: number;
  name: string;
}

import { Loader } from "../../components/Loader";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
    secretKey: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await roomsService.getRooms();
        setRooms(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRoom = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', webhookUrl: '', secretKey: '' });
  };

  const handleSubmit = () => {
    if (formData.name.trim()) {
      setRooms((prev) => {
        roomsService.createRooms({
          name: formData.name,
          webhookUrl: formData.webhookUrl,
          secretKey: formData.secretKey,
        });
        return [
          ...prev,
          { id: Date.now(), name: formData.name },
        ]
      });
      handleCloseDialog();
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", py: 6 }}>
      <Paper elevation={2} sx={{ width: "100%", borderRadius: 6, p: 4 }}>
        <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
          Список комнат
        </Typography>
        <List sx={{ mt: 4 }}>
          {rooms.length ? rooms.map((room) => (
            <ListItem key={room.id} disablePadding sx={{ mb: 2, borderRadius: 3, boxShadow: 1, border: 1, overflow: "hidden" }}>
              <ListItemButton component={Link} to={`/rooms/${room.id}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ListItemText primary={room.name} />
                <IconButton edge="end" size="small" sx={{ ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          )): <>Нет созданных комнат</>}
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

      {/* Модальное окно создания комнаты */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новую комнату</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Название комнаты"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange('name')}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Webhook URL"
              fullWidth
              variant="outlined"
              value={formData.webhookUrl}
              onChange={handleInputChange('webhookUrl')}
              placeholder="https://"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Секретный ключ"
              fullWidth
              variant="outlined"
              type="password"
              value={formData.secretKey}
              onChange={handleInputChange('secretKey')}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
