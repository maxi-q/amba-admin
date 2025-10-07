import { Edit as EditIcon } from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import { useSprints } from "@/hooks/sprints/useSprints";
import { Loader } from "@/components/Loader";

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
  const { slug } = useParams();
  const navigate = useNavigate();

  // Используем хук для получения спринтов
  const { 
    sprints, 
    isLoading, 
    isError, 
    error 
  } = useSprints(
    { page: 1, size: 100 }, // Показываем все спринты
    slug || ''
  );

  const handleCreateSprint = () => {
    navigate(`/rooms/${slug}/sprints/new`);
  };

  // Показываем загрузку
  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  // Показываем ошибку
  if (isError) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке спринтов: {error?.message || 'Неизвестная ошибка'}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Stack direction="row" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700} mb={0}>
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
        {sprints.filter((sprint) => !sprint.isDeleted).map((sprint) => {
          const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
          const isActive = isEventActive(sprint.startDate, sprint.endDate);
          const {labelEvent, colorEvent} = checkStatusEvent(sprint.startDate, sprint.endDate);

          return (
          <Paper
            key={sprint.id}
            component={Link}
            to={`${sprint.id}`}
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

        {sprints.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" mb={2}>
              Спринтов пока нет
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создайте первый спринт, чтобы начать работу
            </Typography>
          </Box>
        )}

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
    </Box>
  );
}
