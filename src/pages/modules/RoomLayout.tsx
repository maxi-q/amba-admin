import { useGetProject } from "@/hooks/projects/useGetProject";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
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
    project,
    isLoading: isLoadingProject,
    isError: isProjectError,
    error: projectError
  } = useGetProject();

  const isLoading = (!room && isLoadingRoom) || (!project && isLoadingProject);

  if (isLoading) {
    return <Loader />;
  }

  if ((!room && isRoomError) || (!project && isProjectError)) {
    return (
      <div className="w-full px-4 py-6">
        {!room && isRoomError && <div>Ошибка загрузки компании: {roomError?.message}</div>}
        {!project && isProjectError && <div>Ошибка загрузки проекта: {projectError?.message}</div>}
      </div>
    );
  }

  if (!room || !project) {
    return <Loader />;
  }

  return <RoomBox><Outlet /></RoomBox>;
}
