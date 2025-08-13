import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { useRoomDataStore } from "@store/index";
import { useDebouncedCallback } from 'use-debounce';
import eventsService from "@services/events/events.service";
import type { IPatchEventsRequest } from "@services/events/events.types";
import { dateToInput } from "./helpers";

const rewardUnits = [
  { value: "points", label: "Баллы" },
  { value: "rub", label: "Рубли" },
  { value: "usd", label: "Доллары" },
  { value: "eur", label: "Евро" },
  { value: "items", label: "Штуки" },
];

interface SubscriberGroup {
  id: number;
  title: string;
  name: string;
  senlerId: number;
  isExcluded?: boolean;
}

const EventsSetting = () => {
  const { eventId, slug } = useParams();
  const { updateEvent, eventData } = useRoomDataStore();
  const [event, setEvent] = useState<any>(null);
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
  });

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
      });
    }
  }, [eventId, eventData]);

  useEffect(()=>{
    console.log(formData)
  }, [formData])

  const debouncedUpdate = useDebouncedCallback(
    async (data: IPatchEventsRequest) => {
      if (eventId) {
        try {
          const storeData = {
            name: data.name,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            ignoreEndDate: data.ignoreEndDate,
            rewardType: data.rewardType,
            rewardUnits: data.rewardUnits,
            rewardValue: data.rewardValue,
            promoCodeUsageLimit: data.promoCodeUsageLimit,
            ignorePromoCodeUsageLimit: data.ignorePromoCodeUsageLimit,
          }

          const response = await eventsService.patchEvents(storeData, eventId);
          if (response.status === 200) {
            updateEvent(eventId, storeData);
          }
        } catch (error) {
          console.error('Ошибка при обновлении события:', error);
        }
      }
    },
    1000
  );

  const handleInputChange = (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: field === 'rewardValue' || field === 'promoCodeUsageLimit' ? Number(newValue) : newValue
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleSelectChange = (field: keyof IPatchEventsRequest) => (event: any) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleCheckboxChange = (field: keyof IPatchEventsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  if (!event) {
    return <Box p={3}>Загрузка...</Box>;
  }

  const subscriberGroups: SubscriberGroup[] = [
    {
      id: 1,
      title: "Группа подписчиков в Senler для подачи заявки участие в событии",
      name: "Заявки на событие ID: 4 | Конференция 2025",
      senlerId: 2353,
    },
    {
      id: 2,
      title: "Группа подписчиков в Senler для одобренных участников",
      name: "Участники события ID: 4 | Конференция 2025",
      senlerId: 2354,
    },
    {
      id: 3,
      title: "Группа подписчиков в Senler для исключенных участников",
      name: "Исключенные из события ID: 4 | Конференция 2025",
      senlerId: 2355,
      isExcluded: true,
    },
  ];

  const handleDelete = () => {
    console.log('delete');
  }

  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/events`} underline="hover" color="inherit">
            Список событий
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {event.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Stack spacing={4}>
        {/* Settings Section */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
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
              <Typography variant="subtitle2" mb={1}>
                Ограничить событие датами
              </Typography>
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
                <Checkbox 
                  checked={formData.ignoreEndDate}
                  onChange={handleCheckboxChange('ignoreEndDate')}
                />
              </Stack>
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

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle2" mb={1}>
                  Ограничить число использования каждого промокода
                </Typography>
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
              </Box>
              <Checkbox
                checked={formData.ignorePromoCodeUsageLimit}
                onChange={handleCheckboxChange('ignorePromoCodeUsageLimit')}
              />
            </Stack>
            <Box mt={3}>
              <button
                style={{
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleDelete}
              >
                Удалить спринт
              </button>
            </Box>
          </Stack>
        </Paper>

        {/* Subscriber Groups */}
        {subscriberGroups.map((group) => (
          <Paper key={group.id} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              mb={2}
              color={group.isExcluded ? "error.main" : "text.primary"}
            >
              {group.title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", border: "2px dashed #ccc" }} />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {group.senlerId}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <MuiLink href="#" underline="hover" sx={{ cursor: "pointer" }}>
                редактированию группу
              </MuiLink>
              <MuiLink href="#" underline="hover" sx={{ cursor: "pointer" }}>
                список пользователей
              </MuiLink>
              <MuiLink href="#" underline="hover" sx={{ cursor: "pointer" }}>
                как использовать?
              </MuiLink>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default EventsSetting;