import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  TextField,
  MenuItem,
  Select,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useRoomDataStore } from "@store/index";
import { useState } from "react";
import eventsService from "@services/events/events.service";
import type { IEvent, ICreateEventRequest } from "@services/events/events.types";

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

export default function EventsPage() {
  const { slug } = useParams();
  const { roomData, eventData, addEvent } = useRoomDataStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ICreateEventRequest>({
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

  const handleCreateEvent = () => {
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
      const response = await eventsService.createEvent({
        ...formData,
        roomId: roomData.id,
      });
      if (response.status === 201) {
        addEvent(response.data);
      }
      handleCloseDialog();
    }
  };

  const handleInputChange = (field: keyof ICreateEventRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNumberInputChange = (field: keyof ICreateEventRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(event.target.value)
    }));
  };

  const handleSelectChange = (field: keyof ICreateEventRequest) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} mb={0}>
          Список событий
        </Typography>
        <Box flex={1} />
        <Link to={'info'} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          подробнее
        </Link>
      </Stack>
      
      <Stack spacing={2}>
        {eventData?.filter(event => !event.isDeleted).map((event: IEvent) => {
          const dateRange = formatDateRange(event.startDate, event.endDate);
          const isActive = isEventActive(event.startDate, event.endDate);
          
          return (
            <Paper
              key={event.id}
              component={Link}
              to={`/rooms/${slug}/events/${event.id}`}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 3,
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: event.isDeleted ? 0.6 : 1,
                bgcolor: event.isDeleted ? 'grey.50' : 'background.paper',
                border: isActive ? '2px solid #4caf50' : '1px solid #e0e0e0',
                '&:hover': {
                  bgcolor: event.isDeleted ? 'grey.100' : 'action.hover',
                },
                cursor: 'pointer',
              }}
            >
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={500} 
                  mb={1}
                  sx={{
                    textDecoration: event.isDeleted ? 'line-through' : 'none',
                    color: event.isDeleted ? 'text.disabled' : 'inherit',
                  }}
                >
                  {event.name}
                </Typography>
                <Typography
                  variant="body2"
                  color={event.isDeleted ? "text.disabled" : (isActive ? "success.main" : "text.secondary")}
                  fontWeight={isActive ? 500 : 400}
                  sx={{
                    textDecoration: event.isDeleted ? 'line-through' : 'none',
                  }}
                >
                  {dateRange}
                </Typography>
              </Box>

              <Stack direction="row" alignItems="center" spacing={2}>
                {!event.isDeleted && (
                  <Chip
                    label={isActive ? "активный" : "неактивный"}
                    color={isActive ? "success" : "default"}
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                )}
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          );
        })}

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
            onClick={handleCreateEvent}
          >
            Добавить событие
          </Button>
        </Box>
      </Stack>

      {/* Модальное окно создания события */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новое событие</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Название события"
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
                <MenuItem value="fix">Фиксированная</MenuItem>
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
