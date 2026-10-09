import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useEvents } from "@/hooks/events/useEvents";
import { Button, PageLoader } from "@senler/ui";
import { CircleQuestionMark } from "lucide-react";
import { EventsErrorState } from "./components/EventsErrorState";
import { EventsEmptyState } from "./components/EventsEmptyState";
import { EventCard } from "./components/EventCard";
import { CreateEventButton } from "./components/CreateEventButton";
import { EventInstructionsDialog } from "./components/EventInstructionsDialog";

/**
 * Страница со списком событий для комнаты
 * Отображает список событий, позволяет создавать новые и переходить к редактированию существующих
 */
export default function EventsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const {
    events: eventData,
    isLoading,
    isError,
    error
  } = useEvents(
    { page: 1, size: 100 },
    slug || '',
    { allPages: true }
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
    <div className="-m-4 min-h-full w-[calc(100%+2rem)] bg-white text-black">
      <header className="flex h-12 items-center justify-between gap-2 border-b border-[#e4e4e4] px-4">
        <h1 className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 tracking-[-0.0325px]">
          События
        </h1>
        {activeEvents.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setInstructionsOpen(true)}
            className="h-7 gap-1 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium leading-4 shadow-none"
          >
            <CircleQuestionMark className="size-4 text-[#707070]" strokeWidth={1.5} />
            Инструкция
          </Button>
        ) : null}
        <CreateEventButton onClick={handleCreateEvent} />
      </header>

      {activeEvents.length === 0 ? (
        <EventsEmptyState onCreateClick={handleCreateEvent} />
      ) : (
        <div className="overflow-x-auto">
          {activeEvents.map((event) => (
            <EventCard key={event.id} event={event} roomSlug={slug || ""} />
          ))}
        </div>
      )}

      <EventInstructionsDialog open={instructionsOpen} onOpenChange={setInstructionsOpen} />
    </div>
  );
}
