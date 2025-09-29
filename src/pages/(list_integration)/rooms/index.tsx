import { useState, useEffect } from "react";
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
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

import { Loader } from "../../../components/Loader";
import { useRooms } from "@/hooks/rooms/useRooms";
import { useCreateRoom } from "@/hooks/rooms/useCreateRoom";

export default function RoomsPage() {
  const { rooms, isLoading } = useRooms();
  const { 
    createRoom, 
    isPending, 
    isValidationError, 
    validationErrors,
    generalError: hookGeneralError
  } = useCreateRoom();

  useEffect(() => {
    console.log(isValidationError);
    console.log(validationErrors);
    console.log(hookGeneralError);
  }, [isValidationError, validationErrors, hookGeneralError]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhookUrl: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  // Синхронизируем ошибки из хука с локальным состоянием
  useEffect(() => {
    if (isValidationError && Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setGeneralError('');
    } else if (hookGeneralError) {
      setGeneralError(hookGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isValidationError, validationErrors, hookGeneralError]);

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

    setFieldErrors({});
    setGeneralError('');

    createRoom({
      name: formData.name,
      webhookUrl: formData.webhookUrl,
    });
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  if (isLoading) {
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
              disabled={!formData.name.trim() || isPending}
              size="large"
            >
              {isPending ? 'Создание...' : 'Создать'}
            </Button>
          </Box>
        </Container>
      </Dialog>
    </Box>
  );
}
