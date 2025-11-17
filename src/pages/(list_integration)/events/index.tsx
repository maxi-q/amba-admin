import { useNavigate, useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { useEvents } from "@/hooks/events/useEvents";
import { Loader } from "@/components/Loader";
import { EventsHeader } from "./components/EventsHeader";
import { EventsErrorState } from "./components/EventsErrorState";
import { EventsEmptyState } from "./components/EventsEmptyState";
import { EventCard } from "./components/EventCard";
import { CreateEventButton } from "./components/CreateEventButton";

/**
 * Страница со списком событий для комнаты
 * Отображает список событий, позволяет создавать новые и переходить к редактированию существующих
 */
export default function EventsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    events: eventData,
    isLoading,
    isError,
    error
  } = useEvents(
    { page: 1, size: 100 },
    slug || ''
  );

  const handleCreateEvent = () => {
    navigate(`/rooms/${slug}/events/new`);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Loader />
      </Box>
    );
  }

  if (isError) {
    return <EventsErrorState errorMessage={error?.message} />;
  }

  const activeEvents = eventData?.filter(event => !event.isDeleted) || [];

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <EventsHeader infoLink="info" />

      <Stack spacing={2}>
        {activeEvents.length === 0 ? (
          <EventsEmptyState />
        ) : (
          activeEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              roomSlug={slug || ''}
            />
          ))
        )}

        <CreateEventButton onClick={handleCreateEvent} />
      </Stack>
    </Box>
  );
}
