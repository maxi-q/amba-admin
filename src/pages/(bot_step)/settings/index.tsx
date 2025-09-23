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
import { ExpandMore, Refresh, ContentCopy } from "@mui/icons-material";
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
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    if (roomData) {
      setRoomName(roomData.name || '');
      setWebhookUrl(roomData.webhookUrl || '');
      setSecretKey(roomData.secretKey || '');
    }
  }, [roomData]);

  const handleSaveName = async () => {
    if (!slug) return;

    try {
      const payload = {
        name: roomName
      };

      await roomsService.updateRooms(payload, slug);
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Ошибка при обновлении названия комнаты:', error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!slug) return;

    try {
      const payload = {
        webhookUrl
      };

      await roomsService.updateRooms(payload, slug);
      setShowSaveNotification(true);
    } catch (error) {
      console.error('Ошибка при обновлении вебхука:', error);
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
        isDeleted: true
      };

      await roomsService.updateRooms(payload, slug);
      navigate(`/rooms/`);
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

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  const handleCloseCopyNotification = () => {
    setShowCopyNotification(false);
  };

  if (!roomData) {
    return null;
  }

  const changeRoomName = (value: string) => {
    setRoomName(value);
  };

  const generateSecretKey = async () => {
    if (!slug) return;

    setIsGeneratingKey(true);
    try {
      const response = await roomsService.rotateSecretKey(slug);

      if (response.data) {
        setSecretKey(response.data);
        // Обновляем данные в store
        if (roomData) {
          roomData.secretKey = response.data;
        }
      }
    } catch (error) {
      console.error('Ошибка при генерации секретного ключа:', error);
    } finally {
      setIsGeneratingKey(false);
    }
  };



  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
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

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, my: 4 }}>
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
          color="primary"
          onClick={handleSaveName}
          sx={{ minWidth: 120 }}
        >
          Сохранить
        </Button>
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
                onClick={handleSaveWebhook}
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
                value={secretKey || ''}
                size="medium"
                variant="outlined"
                type="password"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton
                      onClick={() => handleCopyToClipboard(secretKey || '')}
                      color="primary"
                      size="small"
                      sx={{ mr: 0.5 }}
                    >
                      <ContentCopy />
                    </IconButton>
                  )
                }}
              />
              <IconButton 
                onClick={generateSecretKey} 
                color="primary"
                disabled={isGeneratingKey}
              >
                <Refresh sx={{ 
                  animation: isGeneratingKey ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Код для установки на сайт */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Код для установки на сайт
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Разместите код как можно ближе к началу страницы, Например, в пределах тегов &lt;head&gt;&lt;/head&gt; или &lt;body&gt;&lt;/body&gt;
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Это универсальный код, который подходит для всех комнат, его нужно вставить на сайт только один раз
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  value={`<script async="" src="https://ambassador.sen.collabox.dev/index.js"></script>
<link href="https://ambassador.sen.collabox.dev/index.css" rel="stylesheet">`}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '14px' }
                  }}
                />
                <IconButton
                  onClick={() => handleCopyToClipboard(`<script type="text/javascript">
  ...
</script>`)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}
                  color="primary"
                >
                  <ContentCopy />
                </IconButton>
              </Box>
            </Box>

            {/* Код для вызова формы */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Код для вызова формы с вводом промокода
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  openPromoAmbSEN(&lt;unique_id&gt;, &lt;security_code&gt;, &lt;room_id&gt;)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>unique_id</strong> - идентификатор, по которому нужно ограничивать повторное использование промокодов
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>security_code</strong> - секретный ключ для защиты запросов. Вы можете указать этот параметр, чтобы защитить использование промокодов от недобросовестных пользователей. Его нужно сгенерировать на сервере, чтобы защитить алгоритм его формирования. Например, можно использовать функцию md5, в которой зашифровать unique_id и придуманную вами строку, чтобы потом проверить в вебхуке данный параметр md5(unique_id+'45rtwtwb')
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>room_id</strong> - идентификатор комнаты. Текущий ID = {roomData?.id || 'N/A'}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                Пример:
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  value={`<a href="#" onclick="openPromoAmbSEN(123, 'sdfsdfg4', ${roomData?.id || 56})">Ввести промокод</a>`}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '14px' }
                  }}
                />
                <IconButton
                  onClick={() => handleCopyToClipboard(`<a href="#" onclick="openPromoAmbSEN(123, 'sdfsdfg4', ${roomData?.id || 56})">Ввести промокод</a>`)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}
                  color="primary"
                >
                  <ContentCopy />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

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

      {/* Copy Success Notification */}
      <Snackbar
        open={showCopyNotification}
        autoHideDuration={2000}
        onClose={handleCloseCopyNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyNotification} severity="info" sx={{ width: '100%', cursor: 'pointer' }}>
          {/* Секретный ключ скопирован в буфер обмена */}
          Скопировано
        </Alert>
      </Snackbar>
    </Box>
  );
}
