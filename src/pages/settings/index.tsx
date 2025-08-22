import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ExpandMore, Refresh } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useRoomDataStore } from "@store/index";
import roomsService from "@services/rooms/rooms.service";

export default function SettingPage() {
  const { roomData } = useRoomDataStore();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState(roomData?.name || '')
  const [webhookUrl, setWebhookUrl] = useState(roomData?.webhookUrl || '');
  const [secretKey, setSecretKey] = useState(roomData?.secretKey || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    if (roomData) {
      setRoomName(roomData.name || '');
      setWebhookUrl(roomData.webhookUrl || '');
      setSecretKey(roomData.secretKey || '');
    }
  }, [roomData]);

  const handleSave = async () => {
    if (!slug) return;

    try {
      const payload = {
        name: roomName,
        webhookUrl,
        secretKey,
        isDeleted: false
      };

      await roomsService.updateRooms(payload, slug);
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Ошибка при обновлении комнаты:', error);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    if (!slug) return;

    try {
      const payload = {
        name: roomName,
        webhookUrl,
        secretKey,
        isDeleted: true
      };
      
      await roomsService.updateRooms(payload, slug);
      navigate(`/rooms/${slug}`);
    } catch (error) {
      console.error('Ошибка при удалении комнаты:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleCloseSaveNotification = () => {
    setShowSaveNotification(false);
  };

  if (!roomData) {
    return null;
  }

  const changeRoomName = (value: string) => {
    setRoomName(value);
  };

  const generateSecretKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSecretKey(newKey);
  };

  const saveWebhook = () => {
    console.log("Saving webhook:", webhookUrl);
  };

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Box mb={4}>
        <Typography variant="subtitle2" mb={1.5}>
          Название:
        </Typography>
        <TextField
          fullWidth
          value={roomName}
          onChange={(e) => changeRoomName(e.target.value)}
          size="medium"
          variant="outlined"
        />
      </Box>

      {/* Вебхук секция */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="webhook-content"
          id="webhook-header"
        >
          <Typography variant="h6">Вебхук</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" mb={1.5}>
              Адрес:
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                size="medium"
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={saveWebhook}
                sx={{ minWidth: 120 }}
              >
                Сохранить
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={3}>
              На этот адрес будут отправляться запросы после того как привлеченный пользователь активировал промокод
            </Typography>

            <Typography variant="subtitle2" mb={1.5}>
              Секретный ключ
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                size="medium"
                variant="outlined"
                type="password"
              />
              <IconButton onClick={generateSecretKey} color="primary">
                <Refresh />
              </IconButton>
            </Box>

            <Link
              component={RouterLink}
              to={`/rooms/${slug}/setting/info`}
              underline="hover"
              color="primary"
              sx={{ cursor: 'pointer' }}
            >
              описание формата вебхука
            </Link>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Форма для сайта секция */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="form-content"
          id="form-header"
        >
          <Typography variant="h6">Форма для сайта</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Здесь будет содержимое формы для сайта
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          sx={{ minWidth: 120 }}
        >
          Удалить
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          sx={{ minWidth: 120 }}
        >
          Сохранить
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы уверены, что хотите удалить комнату "{roomData?.name}"? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Success Notification */}
      <Snackbar
        open={showSaveNotification}
        autoHideDuration={3000}
        onClose={handleCloseSaveNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSaveNotification} severity="success" sx={{ width: '100%' }}>
          Настройки успешно сохранены
        </Alert>
      </Snackbar>
    </Box>
  );
}
