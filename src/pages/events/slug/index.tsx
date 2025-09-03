import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Paper,
  Switch,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useRoomDataStore } from "@store/index";
import eventsService from "@services/events/events.service";
import type { IEvent, IPatchEventsRequest } from "@services/events/events.types";
import { dateToInput } from "./helpers";

const rewardUnits = [
  { value: "points", label: "Баллы" },
  { value: "rub", label: "Рубли" },
  { value: "usd", label: "Доллары" },
  { value: "eur", label: "Евро" },
  { value: "items", label: "Штуки" },
];



const EventsSetting = () => {
  const { eventId, slug } = useParams();
  const { updateEvent, eventData, addEvent } = useRoomDataStore();
  const [event, setEvent] = useState<IEvent>();
  const { project } = useRoomDataStore();
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<IPatchEventsRequest>({
    name: '',
    startDate: '',
    endDate: '',
    ignoreEndDate: false,
    rewardType: 'fix',
    rewardUnits: '',
    rewardValue: 0,
    promoCodeUsageLimit: 0,
    ignorePromoCodeUsageLimit: false,
    isDeleted: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const foundEvent = eventData.find(event => event.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      setFormData({
        name: foundEvent.name,
        startDate: dateToInput(foundEvent.startDate),
        endDate: dateToInput(foundEvent.endDate),
        ignoreEndDate: foundEvent.ignoreEndDate,
        rewardType: foundEvent.rewardType,
        rewardUnits: foundEvent.rewardUnits,
        rewardValue: foundEvent.rewardValue,
        promoCodeUsageLimit: foundEvent.promoCodeUsageLimit,
        ignorePromoCodeUsageLimit: foundEvent.ignorePromoCodeUsageLimit,
        isDeleted: foundEvent.isDeleted,
      });
    }
  }, [eventId, eventData]);

  useEffect(()=>{
    console.log(formData)
  }, [formData])

  const handleSave = async (isDeleted: boolean = false) => {
    const storeData = {
      name: formData.name,
      startDate: (formData.startDate ? new Date(formData.startDate) : new Date()).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
      ignoreEndDate: formData.ignoreEndDate,
      rewardType: formData.rewardType,
      rewardUnits: formData.rewardUnits,
      rewardValue: formData.rewardValue,
      promoCodeUsageLimit: formData.promoCodeUsageLimit,
      ignorePromoCodeUsageLimit: formData.ignorePromoCodeUsageLimit,
      isDeleted: isDeleted,
    }
    if (eventId !== 'new') {
      try {
        const response = await eventsService.patchEvents(storeData, eventId || '');
        if (response.status === 200) {
          updateEvent(eventId || '', storeData);
        }
      } catch (error) {
        console.error('Ошибка при обновлении события:', error);
      }
    } else if (slug) {
      const response = await eventsService.createEvent({...storeData, roomId: slug});
      if (response.status === 201) {
        addEvent(response.data);
        navigate(`/rooms/${slug}/events/${response.data.id}`);
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    await handleSave(true);
    navigate(`/rooms/${slug}/events`);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleInputChange = (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: field === 'rewardValue' || field === 'promoCodeUsageLimit' ? Number(newValue) : newValue
    };
    setFormData(updatedData);
  };

  const handleSelectChange = (field: keyof IPatchEventsRequest) => (event: any) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
  };

  const handleCopyEventId = async () => {
    try {
      await navigator.clipboard.writeText(`ID события:${eventId || 'Ошибка получения ID события'}`);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  const handleCloseNotification = () => {
    setShowCopyNotification(false);
  };

  if (!event && eventId !== 'new') {
    return <Box sx={{ px: 2, py: 3 }}>Загрузка...</Box>;
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/events`} underline="hover" color="inherit">
            Список событий
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {eventId !== 'new' ? event?.name : 'Новое событие'}
          </Typography>
        </Breadcrumbs>
        {eventId !== 'new' && (
          <MuiLink variant="body2" underline="always" color="inherit" onClick={handleCopyEventId}>
            Скопировать ID события
          </MuiLink>
        )}
      </Box>

      <Stack spacing={4}>
        {/* Settings Section */}
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Настройки
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Название
              </Typography>
              <TextField
                fullWidth
                placeholder="Будет показываться вам и определенным амбассадорам"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange('name')}
              />
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">
                  Ограничить событие датами
                </Typography>
                <Switch
                  checked={!formData.ignoreEndDate}
                  onChange={(e) => {
                    const newValue = !e.target.checked;
                    const updatedData = {
                      ...formData,
                      ignoreEndDate: newValue
                    };
                    setFormData(updatedData);
                  }}
                />
              </Stack>
              {!formData.ignoreEndDate && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange('startDate')}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange('endDate')}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  />
                </Stack>
              )}
            </Box>

            {/* <FormControlLabel
              control={
                <Switch defaultChecked />
              }
              label="Автоматически добавить в список амбассадоров"
            /> */}

            <Box>
              <Typography variant="h5" fontWeight={700} mb={2}>Промокоды</Typography>
              <Typography variant="body2" color="text.secondary" maxWidth="md">
                Для какого участка будет спеймерован уникальный промокод, который отправится при добавлении в группу амбассадоров, а также будет отправлен указанные ниже награды
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" mb={1}>
                Единицы награды
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.rewardUnits}
                  onChange={handleSelectChange('rewardUnits')}
                  variant="outlined"
                >
                  {rewardUnits.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle2" mb={1}>
                Награда для привлеченных пользователей
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="number"
                  value={formData.rewardValue}
                  onChange={handleInputChange('rewardValue')}
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formData.rewardUnits === 'rub' ? 'руб' :
                   formData.rewardUnits === 'usd' ? 'долл' :
                   formData.rewardUnits === 'eur' ? 'евро' :
                   formData.rewardUnits === 'points' ? 'баллов' :
                   formData.rewardUnits === 'items' ? 'штук' : 'ед'}
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">
                  Ограничить число использования каждого промокода
                </Typography>
                <Switch
                  checked={!formData.ignorePromoCodeUsageLimit}
                  onChange={(e) => {
                    const newValue = !e.target.checked;
                    const updatedData = {
                      ...formData,
                      ignorePromoCodeUsageLimit: newValue
                    };
                    setFormData(updatedData);
                  }}
                />
              </Stack>
              {!formData.ignorePromoCodeUsageLimit && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="number"
                    value={formData.promoCodeUsageLimit}
                    onChange={handleInputChange('promoCodeUsageLimit')}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    раз
                  </Typography>
                </Stack>
              )}
            </Box>
            {/* <Box mt={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDeleted}
                    onChange={handleSwitchChange('isDeleted')}
                    color="error"
                  />
                }
                label="Удалить событие"
              />
            </Box> */}
          </Stack>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {eventId !== 'new' && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              sx={{ minWidth: 120 }}
            >
              Удалить
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSave()}
            sx={{ minWidth: 120 }}
          >
            {eventId !== 'new' ? 'Сохранить' : 'Добавить'}
          </Button>
        </Box>
        {eventId !== 'new' && event && (
        <Paper sx={{ borderRadius: 2 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            mb={2}
          >
            Группы подписчиков
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Box sx={{ width: 40, height: 40, borderRadius: "50%", border: "2px dashed #ccc" }} />
            <Box>
              <Typography variant="body1" fontWeight={500}>
                Группа подписчиков в Senler для подачи заявки участие в событии
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: 2353
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1} mt={2}>
            <Typography variant="subtitle2" pb={0.5}>
              Ссылка для вступления в группу для подачи заявки:
            </Typography>
            <TextField
              value={`https://vk.com/app5898182_-${project?.channelExternalId}#s=${event.pendingSubscriptionId}&force=1`}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              size="small"
              sx={{ pb: 3 }}
            />
            <Typography variant="subtitle2" pb={0.5}>
              Ссылка для вступления в группу для одобренных участников:
            </Typography>
            <TextField
              value={`https://vk.com/app5898182_-${project?.channelExternalId}#s=${event.approvedSubscriptionId}&force=1`}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              size="small"
              sx={{ pb: 3 }}
            />
            <Typography variant="subtitle2" pt={0.5}>
              Ссылка для вступления в группу для исключенных участников:
            </Typography>
            <TextField
              value={`https://vk.com/app5898182_-${project?.channelExternalId}#s=${event.rejectedSubscriptionId}&force=1`}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              size="small"
            />
          </Stack>
        </Paper>
        )}
      </Stack>

      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%', cursor: 'pointer' }}>
          {/* ID события скопирован в буфер обмена */}
          Скопировано
        </Alert>
      </Snackbar>

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
            Вы уверены, что хотите удалить событие "{event?.name}"? Это действие нельзя будет отменить.
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
    </Box>
  );
};

export default EventsSetting;