import { useEffect, useState } from "react";
import { Edit as EditIcon } from "@mui/icons-material";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
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
import type { ICreateRoomResponse } from "@services/rooms/rooms.types";

import { Loader } from "../../components/Loader";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<ICreateRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
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
    setFormData({ name: '', webhookUrl: '' });
  };

  const handleSubmit = async () => {
    if (formData.name.trim()) {
      const response = await roomsService.createRooms({
        name: formData.name,
        webhookUrl: formData.webhookUrl,
      });
      if (response.status === 201) {
        setRooms(prev => [...prev, response.data]);
      }
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
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", px: 2, py: 3 }}>
      <Typography variant="h6" align="center" fontWeight={600} gutterBottom>
        Список комнат
      </Typography>
      <Stack direction="row" justifyContent="flex-start" mb={1}>
        <Button
          onClick={handleCreateRoom}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Создать комнату
        </Button>
      </Stack>
      <List >
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
    </Box>
  );
}
