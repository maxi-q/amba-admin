import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRoomDataStore } from "@store/index";
import { useDebouncedCallback } from 'use-debounce';
import sprintsService from "@services/sprints/sprints.service";
import type { IPatchSprintsRequest } from "@services/sprints/sprints.types";
import { dateToInput } from "./helpers";

// const rewardTypes = [
  // { value: "fix", label: "fix" },
// ];

const rewardUnits = [
  { value: "points", label: "Баллы" },
  { value: "rub", label: "Рубли" },
  { value: "usd", label: "Доллары" },
  { value: "eur", label: "Евро" },
  { value: "items", label: "Штуки" },
];

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const { roomData, updateSprint, sprintData } = useRoomDataStore();
  const [sprint, setSprint] = useState<any>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [formData, setFormData] = useState<IPatchSprintsRequest>({
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

  useEffect(() => {
    const foundSprint = sprintData.find(sprint => sprint.id === sprintId);
    if (foundSprint) {
      setSprint(foundSprint);
      setFormData({
        name: foundSprint.name,
        startDate: dateToInput(foundSprint.startDate),
        endDate: dateToInput(foundSprint.endDate),
        ignoreEndDate: foundSprint.ignoreEndDate,
        rewardType: foundSprint.rewardType,
        rewardUnits: foundSprint.rewardUnits,
        rewardValue: foundSprint.rewardValue,
        promoCodeUsageLimit: foundSprint.promoCodeUsageLimit,
        ignorePromoCodeUsageLimit: foundSprint.ignorePromoCodeUsageLimit,
        isDeleted: foundSprint.isDeleted,
      });
    }
  }, [sprintId, roomData]);

  useEffect(()=>{
    console.log(formData)
  }, [formData])

  const debouncedUpdate = useDebouncedCallback(
    async (data: IPatchSprintsRequest) => {
      if (sprintId) {
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
            isDeleted: data.isDeleted,
          }

          const response = await sprintsService.patchSprints(storeData, sprintId);
          if (response.status === 200) {
            updateSprint(sprintId, storeData);
          }
        } catch (error) {
          console.error('Ошибка при обновлении спринта:', error);
        }
      }
    },
    1000
  );

  const handleInputChange = (field: keyof IPatchSprintsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: field === 'rewardValue' || field === 'promoCodeUsageLimit' ? Number(newValue) : newValue
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleSelectChange = (field: keyof IPatchSprintsRequest) => (event: any) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleCopySprintId = async () => {
    try {
      await navigator.clipboard.writeText(`ID спринта:${sprintId || 'Ошибка получения ID спринта'}`);
      setShowCopyNotification(true);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  const handleCloseNotification = () => {
    setShowCopyNotification(false);
  };

  if (!sprint) {
    return <Box p={3}>Загрузка...</Box>;
  }

  return (
    <Box>
      <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
            Список спринтов
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {sprint.name}
          </Typography>
        </Breadcrumbs>
        <MuiLink variant="body2" underline="hover" color="inherit" onClick={handleCopySprintId}>
          Скопировать ID спринта
        </MuiLink>
      </Box>

      <Box p={3}>
        <Typography variant="h4" fontWeight={700} mb={2}>Настройки</Typography>
        
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
                Ограничить спринт датами
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
                  debouncedUpdate(updatedData);
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

          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Промокоды</Typography>
            <Typography variant="body2" color="text.secondary" maxWidth="md">
              Для какого участка будет спеймерован уникальный промокод, который отправится при добавлении в группу амбассадоров, а также будет отправлен указанные ниже награды
            </Typography>
          </Box>

          {/* <Box>
            <Typography variant="subtitle2" mb={1}>
              Тип награды
            </Typography>
            <FormControl fullWidth>
              <Select
                value={formData.rewardType}
                onChange={handleSelectChange('rewardType')}
                variant="outlined"
              >
                {rewardTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box> */}

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
              Награда для приодленных пользователей
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
                  debouncedUpdate(updatedData);
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
        </Stack>
        <Box mt={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDeleted}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      const updatedData = {
                        ...formData,
                        isDeleted: newValue
                      };
                      setFormData(updatedData);
                      debouncedUpdate(updatedData);
                    }}
                    color="error"
                  />
                }
                label="Удалить событие"
              />
            </Box>
      </Box>

      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          ID спринта скопирован в буфер обмена
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SprintSetting