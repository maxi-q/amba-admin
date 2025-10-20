import { useParams } from "react-router-dom";
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
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import { useRotateSecretKey } from "@/hooks/rooms/useRotateSecretKey";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

export default function SettingPage() {
  const { slug } = useParams();
  
  // Получаем данные комнаты через хук
  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError
  } = useGetRoomById(slug || '');

  // Хуки для обновления комнаты и ротации ключа
  const {
    updateRoom,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isValidationError: isUpdateValidationError,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError
  } = useUpdateRoom();

  const {
    rotateSecretKey,
    isPending: isRotating,
    isSuccess: isRotateSuccess,
    isValidationError: isRotateValidationError,
    validationErrors: rotateValidationErrors,
    generalError: rotateGeneralError
  } = useRotateSecretKey();

  const [roomName, setRoomName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  
  // Состояние для ошибок
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  // Инициализируем состояние при загрузке данных комнаты
  useEffect(() => {
    if (room) {
      setRoomName(room.name || '');
      setWebhookUrl(room.webhookUrl || '');
      setSecretKey(room.secretKey || '');
    }
  }, [room]);

  // Синхронизируем ошибки из хуков с локальным состоянием
  useEffect(() => {
    if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError('');
    } else if (isRotateValidationError && Object.keys(rotateValidationErrors).length > 0) {
      setFieldErrors(rotateValidationErrors);
      setGeneralError('');
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else if (rotateGeneralError) {
      setGeneralError(rotateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isUpdateValidationError, updateValidationErrors, updateGeneralError, isRotateValidationError, rotateValidationErrors, rotateGeneralError]);

  // Обработка успешных операций обновления
  useEffect(() => {
    if (isUpdateSuccess) {
      setShowSaveNotification(true);
    }
  }, [isUpdateSuccess]);

  // Обновляем secretKey при успешной ротации
  useEffect(() => {
    if (isRotateSuccess) {
      // Данные обновятся автоматически через хук useGetRoomById
      console.log('Secret key rotated successfully');
    }
  }, [isRotateSuccess]);

  const handleSaveName = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { name: roomName },
      id: slug
    });
  };

  const handleSaveWebhook = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { webhookUrl },
      id: slug
    });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    updateRoom({
      data: { isDeleted: true },
      id: slug
    });
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

  // Показываем загрузку
  if (isLoadingRoom) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  // Показываем ошибку
  if (isRoomError) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке комнаты: {roomError?.message || 'Неизвестная ошибка'}
        </Alert>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="warning">
          Комната не найдена
        </Alert>
      </Box>
    );
  }

  const changeRoomName = (value: string) => {
    setRoomName(value);
  };

  const generateSecretKey = () => {
    if (!slug) return;

    setFieldErrors({});
    setGeneralError('');

    rotateSecretKey(slug);
  };



  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}

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
          error={hasFieldError(fieldErrors, 'name')}
          helperText={getFirstFieldError(fieldErrors, 'name')}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, my: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={isUpdating}
          sx={{ minWidth: 120 }}
        >
          Удалить
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveName}
          disabled={isUpdating}
          sx={{ minWidth: 120 }}
        >
          {isUpdating ? 'Сохранение...' : 'Сохранить'}
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
                error={hasFieldError(fieldErrors, 'webhookUrl')}
                helperText={getFirstFieldError(fieldErrors, 'webhookUrl')}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveWebhook}
                disabled={isUpdating}
                sx={{ minWidth: 120 }}
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
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
                disabled={isRotating}
              >
                <Refresh sx={{ 
                  animation: isRotating ? 'spin 1s linear infinite' : 'none',
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
                  <strong>room_id</strong> - идентификатор комнаты. Текущий ID = {room?.id || 'N/A'}
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
                  value={`<a href="#" onclick="openPromoAmbSEN(123, 'sdfsdfg4', ${room?.id || 56})">Ввести промокод</a>`}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '14px' }
                  }}
                />
                <IconButton
                  onClick={() => handleCopyToClipboard(`<a href="#" onclick="openPromoAmbSEN(123, 'sdfsdfg4', ${room?.id || 56})">Ввести промокод</a>`)}
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
            Вы уверены, что хотите удалить комнату "{room?.name}"? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary" disabled={isUpdating}>
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={isUpdating}>
            {isUpdating ? 'Удаление...' : 'Удалить'}
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
