import { useNavigate, useParams } from "react-router-dom";
import { useEvents } from "@/hooks/events/useEvents";
import { PageLoader } from "@senler/ui";
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
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError) {
    return <EventsErrorState errorMessage={error?.message} />;
  }

  const activeEvents = eventData?.filter(event => !event.isDeleted) || [];

  return (
    <div className="w-full px-2 pb-6">
      <div className="flex flex-col gap-2">
        {activeEvents.length === 0 ? (
          <EventsEmptyState onCreateClick={handleCreateEvent} />
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
      </div>
    </div>
  );
}
