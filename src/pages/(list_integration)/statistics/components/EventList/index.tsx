import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import type { EventListProps, EventData } from '../../types';

export const EventList = ({ events }: EventListProps) => {
  const [displayedEvents, setDisplayedEvents] = useState(events.slice(0, 5));
  const [hasMore, setHasMore] = useState(events.length > 5);

  useEffect(() => {
    setDisplayedEvents(events.slice(0, 5));
    setHasMore(events.length > 5);
  }, [events]);

  const handleLoadMore = () => {
    const currentLength = displayedEvents.length;
    const nextBatch = events.slice(currentLength, currentLength + 5);
    setDisplayedEvents([...displayedEvents, ...nextBatch]);
    setHasMore(displayedEvents.length + nextBatch.length < events.length);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Количество: {events.length}
      </Typography>
      
      <Stack spacing={2}>
        {displayedEvents.map((event: EventData) => (
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
        
        {hasMore && (
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{ mt: 2 }}
          >
            Загрузить еще
          </Button>
        )}
      </Stack>
    </Box>
  );
};
