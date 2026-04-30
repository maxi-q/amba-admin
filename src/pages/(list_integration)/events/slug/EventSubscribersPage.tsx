import { useParams } from "react-router-dom";
import { PageLoader } from "@senler/ui";
import { useEvents } from "@/hooks/events/useEvents";
import { useGetProject } from "@/hooks/projects/useGetProject";
import { SubscriberGroupsSection } from "./components/SubscriberGroupsSection";
import { EventErrorState } from "./components/EventErrorState";
import { EventNotFoundState } from "./components/EventNotFoundState";

/**
 * Подпункт «Группы подписчиков» события.
 */
const EventSubscribersPage = () => {
  const { eventId, slug } = useParams();

  const {
    events: eventData,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError,
  } = useEvents({ page: 1, size: 100 }, slug || "");

  const {
    project,
    isLoading: isLoadingProject,
    isError: isProjectError,
    error: projectError,
  } = useGetProject();

  if (isLoadingEvents || isLoadingProject) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isEventsError || isProjectError) {
    return (
      <EventErrorState
        eventsError={eventsError?.message}
        projectError={projectError?.message}
      />
    );
  }

  const event = eventData?.find((e) => e.id === eventId);

  if (!event) {
    return <EventNotFoundState />;
  }

  return (
    <div className="w-full px-2 py-6">
      <SubscriberGroupsSection
        event={event}
        channelExternalId={project?.channelExternalId}
      />
    </div>
  );
};

export default EventSubscribersPage;
