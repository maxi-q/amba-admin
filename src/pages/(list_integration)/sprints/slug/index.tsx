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
  const { roomData, updateSprint, sprintData, addSprint } = useRoomDataStore();
  const [sprint, setSprint] = useState<any>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<IPatchSprintsRequest>({
    name: '',
    startDate: null,
    endDate: null,
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

  const handleSave = async (isDeleted: boolean = false) => {

    const storeData = {
      name: formData.name,
      startDate: (formData.startDate ? new Date(formData.startDate) : new Date()).toISOString(),
      endDate: dateToInput(formData.endDate),
      ignoreEndDate: formData.ignoreEndDate,
      rewardType: formData.rewardType,
      rewardUnits: formData.rewardUnits,
      rewardValue: formData.rewardValue,
      promoCodeUsageLimit: formData.promoCodeUsageLimit,
      ignorePromoCodeUsageLimit: formData.ignorePromoCodeUsageLimit,
      isDeleted: isDeleted,
    }
    if (sprintId !== 'new') {
      try {
        const response = await sprintsService.patchSprints(storeData, sprintId || '');
        if (response.status === 200) {
          updateSprint(sprintId || '', storeData);
        }
      } catch (error) {
        console.error('Ошибка при обновлении спринта:', error);
      }
    } else if (slug) {
      const response = await sprintsService.createSprint({...storeData, roomId: slug});
      if (response.status === 201) {
        addSprint(response.data);
        navigate(`/rooms/${slug}/sprints/${response.data.id}`);
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    await handleSave(true);
    navigate(`/rooms/${slug}/sprints`);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleInputChange = (field: keyof IPatchSprintsRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: field === 'rewardValue' || field === 'promoCodeUsageLimit' ? Number(newValue) : newValue
    };
    setFormData(updatedData);
  };

  const handleSelectChange = (field: keyof IPatchSprintsRequest) => (event: any) => {
    const newValue = event.target.value;
    const updatedData = {
      ...formData,
      [field]: newValue
    };
    setFormData(updatedData);
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

  if (!sprint && sprintId !== 'new') {
    return <Box sx={{ px: 2, py: 3 }}>Загрузка...</Box>;
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
            Список спринтов
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {sprintId !== 'new' ? sprint?.name : 'Новый спринт'}
          </Typography>
        </Breadcrumbs>
        {sprintId !== 'new' && (
          <MuiLink variant="body2" underline="always" color="inherit" onClick={handleCopySprintId}>
            Скопировать ID спринта
          </MuiLink>
        )}
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>Настройки</Typography>
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
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          {sprintId !== 'new' && (
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
            {sprintId !== 'new' ? 'Сохранить' : 'Добавить'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={showCopyNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%', cursor: 'pointer' }}>
          {/* ID спринта скопирован в буфер обмена */}
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
            Вы уверены, что хотите удалить спринт "{sprint?.name}"? Это действие нельзя будет отменить.
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
  )
}

export default SprintSetting