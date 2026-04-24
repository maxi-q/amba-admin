import { useEvents } from "@/hooks/events/useEvents";
import { useGetProject } from "@/hooks/projects/useGetProject";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useSprints } from "@/hooks/sprints/useSprints";
import { Loader } from "@components/Loader";
import { useParams, Outlet } from "react-router-dom";
import { RoomBox } from "../(list_integration)";

export const RoomLayout = () => {
  const { slug } = useParams();

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError
  } = useGetRoomById(slug || '');

  const {
    isLoading: isLoadingSprints,
    isError: isSprintsError,
    error: sprintsError
  } = useSprints({ page: 1, size: 100 }, slug || '');

  const {
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError
  } = useEvents({ page: 1, size: 100 }, slug || '');

  const {
    isLoading: isLoadingProject,
    isError: isProjectError,
    error: projectError
  } = useGetProject();

  const isLoading = isLoadingRoom || isLoadingSprints || isLoadingEvents || isLoadingProject;

  if (isLoading) {
    return <Loader />;
  }

  if (isRoomError || isSprintsError || isEventsError || isProjectError) {
    return (
      <div className="w-full px-4 py-6">
        {isRoomError && <div>Ошибка загрузки комнаты: {roomError?.message}</div>}
        {isSprintsError && <div>Ошибка загрузки спринтов: {sprintsError?.message}</div>}
        {isEventsError && <div>Ошибка загрузки событий: {eventsError?.message}</div>}
        {isProjectError && <div>Ошибка загрузки проекта: {projectError?.message}</div>}
      </div>
    );
  }

  if (!room) {
    return <Loader />;
  }

  return <RoomBox><Outlet /></RoomBox>;
}
