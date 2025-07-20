import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

interface Event {
  id: number;
  title: string;
  dateRange: string;
  isActive?: boolean;
}

export default function EventsPage() {
  const { slug } = useParams();
  const [events] = useState<Event[]>([
    {
      id: 4,
      title: "Конференция 2025",
      dateRange: "01.02.2025 - 01.07.2025",
      isActive: true,
    },
    {
      id: 3,
      title: "Конференция 2024",
      dateRange: "01.01.2025 - 01.03.2025",
      isActive: false,
    },
  ]);

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
        {events.map((event) => (
          <Box
            component={Link}
            to={`/rooms/${slug}/events/${event.id}`}
            sx={{ textDecoration: 'none' }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 3,
                border: event.isActive ? '2px solid #4caf50' : '1px solid #e0e0e0',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                cursor: 'pointer',
              }}
            >
              <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  ID: {event.id}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  {event.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={event.isActive ? "success.main" : "text.secondary"}
                  fontWeight={event.isActive ? 500 : 400}
                >
                  {event.dateRange}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
