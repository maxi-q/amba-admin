import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useRoomDataStore } from "@store/index";
import type { IEvent } from "@services/events/events.types";


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
  const { eventData } = useRoomDataStore();

  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate(`/rooms/${slug}/events/new`);
  };

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700} mb={0}>
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

    </Box>
  );
}
