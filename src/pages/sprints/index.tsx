import { Edit as EditIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import { useRoomDataStore } from "@store/index";
import { useState } from "react";
import sprintsService from "@services/sprints/sprints.service";
import type { ICreateSprintRequest } from "@services/sprints/sprints.types";

type SprintStatus = "active" | "upcoming" | "past";

const statusColors: Record<SprintStatus, "success" | "warning" | "default"> = {
  active: "success",
  upcoming: "warning",
  past: "default",
};

const statusLabels: Record<SprintStatus, string> = {
  active: "активный",
  upcoming: "предстоящий",
  past: "прошедший",
};

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

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return `${formatDate(start)} - ${formatDate(end)}`;
};

const isEventActive = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now >= start && now <= end;
};

const checkStatusEvent = (startDate: string, endDate: string)  => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now >= start && now <= end ? {labelEvent: statusLabels.active, colorEvent: statusColors.active}
      :  now <= start               ? {labelEvent: statusLabels.upcoming, colorEvent: statusColors.upcoming}
      :  now >= end                 ? {labelEvent: statusLabels.past, colorEvent: statusColors.past}
      : {labelEvent: statusLabels.past, colorEvent: statusColors.past};
};

export default function SprintList() {
  const { roomData, addSprint, sprintData } = useRoomDataStore()

  console.log(roomData)

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ICreateSprintRequest>({
    name: '',
    startDate: '',
    endDate: '',
    ignoreEndDate: false,
    rewardType: 'fix',
    rewardUnits: '',
    rewardValue: 0,
    promoCodeUsageLimit: 0,
    ignorePromoCodeUsageLimit: false,
    roomId: roomData?.id || '',
  });

  const handleCreateSprint = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      ignoreEndDate: false,
      rewardType: 'fix',
      rewardUnits: '',
      rewardValue: 0,
      promoCodeUsageLimit: 0,
      ignorePromoCodeUsageLimit: false,
      roomId: roomData?.id || '',
    });
  };

  const handleSubmit = async () => {
    if (formData.name.trim() && roomData?.id) {
      const response = await sprintsService.createSprint({
        ...formData,
        roomId: roomData.id,
      });
      if (response.status === 201) {
        addSprint({
          isDeleted: false,
          ...response.data
        });
      }
      handleCloseDialog();
    }
  };

  const handleInputChange = (field: keyof ICreateSprintRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNumberInputChange = (field: keyof ICreateSprintRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(event.target.value)
    }));
  };

  const handleSelectChange = (field: keyof ICreateSprintRequest) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={700} mb={0}>
          Список спринтов
        </Typography>
        <Box flex={1} />
        <Link to={'info'} style={{ textDecoration: 'underline', marginRight: 12, cursor: 'pointer' }}>
          подробнее
        </Link>
        <Link
          to="settings"
          style={{
            backgroundColor: 'var(--mui-palette-primary-main, #1976d2)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 500,
            display: 'inline-block'
          }}
        >
          Настройка спринтов
        </Link>
      </Stack>

      <Stack spacing={2}>
        {sprintData?.filter((sprint) => !sprint.isDeleted).map((sprint) => {
          const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
          const isActive = isEventActive(sprint.startDate, sprint.endDate);
          const {labelEvent, colorEvent} = checkStatusEvent(sprint.startDate, sprint.endDate);

          return (
          <Paper
            key={sprint.id}
            component={Link}
            to={`${sprint.id}`}
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: sprint.isDeleted ? 0.6 : 1,
              bgcolor: sprint.isDeleted ? 'grey.50' : 'background.paper',
              '&:hover': {
                bgcolor: sprint.isDeleted ? 'grey.100' : 'action.hover',
              },
            }}
          >
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={500} 
                mb={1}
                sx={{
                  textDecoration: sprint.isDeleted ? 'line-through' : 'none',
                  color: sprint.isDeleted ? 'text.disabled' : 'inherit',
                }}
              >
                {sprint.name}
              </Typography>
              <Typography
                variant="body2"
                color={sprint.isDeleted ? "text.disabled" : (isActive ? "success.main" : "text.secondary")}
                fontWeight={isActive ? 500 : 400}
                sx={{
                  textDecoration: sprint.isDeleted ? 'line-through' : 'none',
                }}
              >
                {dateRange}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={2}>
              {!sprint.isDeleted && (
                <Chip
                  label={labelEvent}
                  color={colorEvent}
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              )}
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        )})}

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            sx={{
              bgcolor: 'success.50',
              borderColor: 'success.200',
              color: 'success.700',
              '&:hover': {
                bgcolor: 'success.100',
                borderColor: 'success.300',
              },
            }}
            onClick={handleCreateSprint}
          >
            Добавить спринт
          </Button>
        </Box>
      </Stack>

      {/* Модальное окно создания спринта */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый спринт</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Название спринта"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange('name')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Дата начала"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.startDate}
              onChange={handleInputChange('startDate')}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Дата окончания"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.endDate}
              onChange={handleInputChange('endDate')}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            
            {/* <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Тип награды</InputLabel>
              <Select
                value={formData.rewardType}
                label="Тип награды"
                onChange={handleSelectChange('rewardType')}
              >
                {rewardTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}

            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Единицы награды</InputLabel>
              <Select
                value={formData.rewardUnits}
                label="Единицы награды"
                onChange={handleSelectChange('rewardUnits')}
              >
                {rewardUnits.map((unit) => (
                  <MenuItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Значение награды"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.rewardValue}
              onChange={handleNumberInputChange('rewardValue')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Лимит использования промокода"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.promoCodeUsageLimit}
              onChange={handleNumberInputChange('promoCodeUsageLimit')}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim() || !formData.startDate || !formData.endDate || !formData.rewardType || !formData.rewardUnits}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
