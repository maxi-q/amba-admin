import { Box, Paper, Stack, Typography, Chip, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import type { IEvent } from "@services/events/events.types";
import { formatDateRange, isEventActive } from "../utils/eventUtils";

interface EventCardProps {
  /** Данные события */
  event: IEvent;
  /** Slug комнаты для формирования ссылки */
  roomSlug: string;
}

/**
 * Карточка события в списке
 * Отображает информацию о событии: название, диапазон дат, статус активности
 * Позволяет перейти к редактированию события по клику
 */
export const EventCard = ({ event, roomSlug }: EventCardProps) => {
  const dateRange = formatDateRange(event.startDate, event.endDate);
  const active = event.ignoreEndDate ? true : isEventActive(event.startDate, event.endDate);

  return (
    <Paper
      component={Link}
      to={`/rooms/${roomSlug}/events/${event.id}`}
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
        border: active ? '2px solid #4caf50' : '1px solid #e0e0e0',
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
          color={event.isDeleted ? "text.disabled" : (active ? "success.main" : "text.secondary")}
          fontWeight={active ? 500 : 400}
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
            label={active ? "активный" : "неактивный"}
            color={active ? "success" : "default"}
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
};

