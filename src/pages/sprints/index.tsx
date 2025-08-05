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

const rewardTypes = [
  { value: "points", label: "Баллы" },
  { value: "currency", label: "Валюта" },
  { value: "items", label: "Предметы" },
];

const rewardUnits = [
  { value: "points", label: "Баллы" },
  { value: "rub", label: "Рубли" },
  { value: "usd", label: "Доллары" },
  { value: "eur", label: "Евро" },
  { value: "items", label: "Штуки" },
];

export default function SprintList() {
  const { roomData, addSprint, sprintData } = useRoomDataStore()

  console.log(roomData)

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ICreateSprintRequest>({
    name: '',
    startDate: '',
    endDate: '',
    rewardType: '',
    rewardUnits: '',
    rewardValue: 0,
    promoCodeUsageLimit: 0,
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
      rewardType: '',
      rewardUnits: '',
      rewardValue: 0,
      promoCodeUsageLimit: 0,
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
        addSprint(response.data);
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
        {sprintData?.map((sprint) => (
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
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={500}>
                {sprint.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sprint.startDate + ' — ' + sprint.endDate || "Без ограничений по датам"}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip
                label={statusLabels.active}
                color={statusColors.active}
                size="small"
                sx={{ borderRadius: 1 }}
              />
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}

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
            
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
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
            </FormControl>
            
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
