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
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useCreateSprint } from "@/hooks/sprints/useCreateSprint";
import { usePatchSprint } from "@/hooks/sprints/usePatchSprint";
import { useSprints } from "@/hooks/sprints/useSprints";
import type { IPatchSprintsRequest, ICreateSprintRequest } from "@services/sprints/sprints.types";
import { dateToInput } from "./helpers";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";
import { Loader } from "@/components/Loader";

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

  // Хуки для работы со спринтами
  const {
    createSprint,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    isValidationError: isCreateValidationError,
    validationErrors: createValidationErrors,
    generalError: createGeneralError
  } = useCreateSprint();

  const {
    patchSprint,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isValidationError: isUpdateValidationError,
    validationErrors: updateValidationErrors,
    generalError: updateGeneralError
  } = usePatchSprint();

  // Получаем список спринтов для поиска текущего
  const { sprints, isLoading: isLoadingSprints } = useSprints(
    { page: 1, size: 100 },
    slug || ''
  );

  const [sprint, setSprint] = useState<any>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showCopyError, setShowCopyError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
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

  // Состояние для ошибок
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');

  // Поиск спринта в списке
  useEffect(() => {
    if (sprintId !== 'new' && sprints.length > 0) {
      const foundSprint = sprints.find(sprint => sprint.id === sprintId);
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
    }
  }, [sprintId, sprints]);

  // Синхронизируем ошибки из хуков с локальным состоянием
  useEffect(() => {
    if (isCreateValidationError && Object.keys(createValidationErrors).length > 0) {
      setFieldErrors(createValidationErrors);
      setGeneralError('');
    } else if (isUpdateValidationError && Object.keys(updateValidationErrors).length > 0) {
      setFieldErrors(updateValidationErrors);
      setGeneralError('');
    } else if (createGeneralError) {
      setGeneralError(createGeneralError);
      setFieldErrors({});
    } else if (updateGeneralError) {
      setGeneralError(updateGeneralError);
      setFieldErrors({});
    } else {
      setFieldErrors({});
      setGeneralError('');
    }
  }, [isCreateValidationError, createValidationErrors, createGeneralError, isUpdateValidationError, updateValidationErrors, updateGeneralError]);

  // Обработка успешных операций
  useEffect(() => {
    if (isCreateSuccess) {
      setShowSaveNotification(true);
      // Навигация к созданному спринту будет выполнена через хук
    }
  }, [isCreateSuccess]);

  useEffect(() => {
    if (isUpdateSuccess) {
      setShowSaveNotification(true);
    }
  }, [isUpdateSuccess]);

  const handleSave = (isDeleted: boolean = false) => {
    setFieldErrors({});
    setGeneralError('');

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
    };

    if (sprintId !== 'new') {
      patchSprint({
        data: storeData,
        sprintId: sprintId || ''
      });
    } else if (slug) {
      const createData: ICreateSprintRequest = {
        ...storeData,
        roomId: slug
      };
      createSprint(createData);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    handleSave(true);
    // Навигация будет выполнена после успешного удаления
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
      setShowCopyError(true);
    }
  };

  const handleCloseNotification = () => {
    setShowCopyNotification(false);
  };

  const handleCloseCopyError = () => {
    setShowCopyError(false);
  };

  const handleCloseSaveNotification = () => {
    setShowSaveNotification(false);
  };

  // Показываем загрузку
  if (isLoadingSprints) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  if (!sprint && sprintId !== 'new') {
    return (
      <Box sx={{ px: 2, py: 3 }}>
        <Alert severity="error">
          Спринт не найден
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}

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
          <MuiLink
            variant="body2"
            underline="always"
            color="inherit"
            sx={{
              userSelect: "none",
              cursor: "pointer"
            }}
            onClick={handleCopySprintId}
          >
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
              error={hasFieldError(fieldErrors, 'name')}
              helperText={getFirstFieldError(fieldErrors, 'name')}
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
                  error={hasFieldError(fieldErrors, 'startDate')}
                  helperText={getFirstFieldError(fieldErrors, 'startDate')}
                />
                <TextField
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange('endDate')}
                  variant="outlined"
                  sx={{ flex: 1 }}
                  error={hasFieldError(fieldErrors, 'endDate')}
                  helperText={getFirstFieldError(fieldErrors, 'endDate')}
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
                error={hasFieldError(fieldErrors, 'rewardValue')}
                helperText={getFirstFieldError(fieldErrors, 'rewardValue')}
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
                  error={hasFieldError(fieldErrors, 'promoCodeUsageLimit')}
                  helperText={getFirstFieldError(fieldErrors, 'promoCodeUsageLimit')}
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
              disabled={isUpdating || isCreating}
              sx={{ minWidth: 120 }}
            >
              Удалить
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSave()}
            disabled={isUpdating || isCreating}
            sx={{ minWidth: 120 }}
          >
            {isUpdating || isCreating 
              ? (sprintId !== 'new' ? 'Сохранение...' : 'Создание...') 
              : (sprintId !== 'new' ? 'Сохранить' : 'Добавить')
            }
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
          Скопировано
        </Alert>
      </Snackbar>

      <Snackbar
        open={showCopyError}
        autoHideDuration={5000}
        onClose={handleCloseCopyError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyError} severity="error" sx={{ width: '100%', cursor: 'pointer' }}>
          Браузер запретил копирование, но вы можете сделать это вручную: {sprintId}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSaveNotification}
        autoHideDuration={3000}
        onClose={handleCloseSaveNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSaveNotification} severity="success" sx={{ width: '100%' }}>
          {sprintId !== 'new' ? 'Спринт успешно сохранен' : 'Спринт успешно создан'}
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
          <Button onClick={handleCancelDelete} color="primary" disabled={isUpdating}>
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={isUpdating}>
            {isUpdating ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SprintSetting