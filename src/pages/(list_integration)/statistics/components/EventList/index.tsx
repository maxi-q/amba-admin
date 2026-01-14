import { Box, Typography, Paper, Stack, Button, CircularProgress } from '@mui/material';
import type { EventListProps, EventData } from '../../types';

export const EventList = ({
  events,
  onLoadMore,
  total,
  hasMore = false,
  isLoadingMore = false,
  isLoading = false
}: EventListProps) => {
  if (isLoading && events.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Количество: {total}
      </Typography>

      <Stack spacing={2}>
        {events.map((event: EventData) => (
          <Paper
            key={event.id}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.event} {event.date}
            </Typography>
          </Paper>
        ))}
        
        {hasMore && onLoadMore && (
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            sx={{ mt: 2 }}
          >
            {isLoadingMore ? 'Загрузка...' : 'Загрузить еще'}
          </Button>
        )}
      </Stack>
    </Box>
  );
};
