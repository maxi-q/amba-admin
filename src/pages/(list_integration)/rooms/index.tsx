import { useEffect, useState } from "react";
import { Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
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
  TextField,
  Box,
  AppBar,
  Toolbar,
  Container,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import roomsService from "@services/rooms/rooms.service";
import type { ICreateRoomResponse } from "@services/rooms/rooms.types";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

import { Loader } from "../../../components/Loader";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<ICreateRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await roomsService.getRooms();
        if (response.data) {
          setRooms(response.data);
        } else if (response.error) {
          setGeneralError(typeof response.error.message === 'string' ? response.error.message : 'Произошла ошибка получения комнат');
        }
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
    setFieldErrors({});
    setGeneralError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setSubmitting(true);
    setFieldErrors({});
    setGeneralError('');

    const response = await roomsService.createRooms({
      name: formData.name,
      webhookUrl: formData.webhookUrl,
    });

    if (response.data) {
      // Success
      setRooms(prev => [...prev, response.data!]);
      handleCloseDialog();
    } else if (response.error) {
      // Handle errors
      if (response.fieldErrors) {
        // Validation errors (422)
        setFieldErrors(response.fieldErrors);
      } else {
        // General error
        setGeneralError(typeof response.error.message === 'string' ? response.error.message : 'Произошла ошибка');
      }
    }

    setSubmitting(false);
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

      {/* Полноэкранное окно создания комнаты */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            maxHeight: '100vh',
            maxWidth: '100vw',
            height: '100vh',
            width: '100vw',
            zIndex: 1300,
          }
        }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Создать новую комнату
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ py: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {generalError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {generalError}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              label="Название комнаты"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={hasFieldError(fieldErrors, 'name')}
              helperText={getFirstFieldError(fieldErrors, 'name')}
              sx={{ mb: 3 }}
            />
            <TextField
              margin="dense"
              label="Webhook URL"
              fullWidth
              variant="outlined"
              value={formData.webhookUrl}
              onChange={handleInputChange('webhookUrl')}
              placeholder="https://"
              error={hasFieldError(fieldErrors, 'webhookUrl')}
              helperText={getFirstFieldError(fieldErrors, 'webhookUrl')}
              sx={{ mb: 4 }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              size="large"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name.trim() || submitting}
              size="large"
            >
              {submitting ? 'Создание...' : 'Создать'}
            </Button>
          </Box>
        </Container>
      </Dialog>
    </Box>
  );
}
