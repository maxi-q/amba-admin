import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react';
import { Box } from '@mui/material';

import {
  SettingPage,
  RoomsPage,
  RoomBox,
  SprintList,
  SprintSetting,
  SprintInfo,
  EventsPage,
  EventsInfo,
  EventsSetting,
  SprintSettingsPage,
  SettingsInfo,
} from './(list_integration)';

import SelectActionPage from './(Bot_step)/main';

import AuthPage from './auth';
import RedirectAuthPage from './redirect_auth';


import { useAuthStore } from '@store/index';
import { useMessage } from '@/messages/messageProvider';
import { useGetRoomById } from '@/hooks/rooms/useGetRoomById';
import { useSprints } from '@/hooks/sprints/useSprints';
import { useEvents } from '@/hooks/events/useEvents';
import { useGetProject } from '@/hooks/projects/useGetProject';
import { getUrlParams } from '@helpers/index';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { Loader } from '../components/Loader';


function RoomLayout() {
  const { slug } = useParams();
  const { sendMessage } = useMessage()

  // Получаем данные через хуки tanstack
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

  useEffect(() => {
    const data = {
      request: {
        type: 'SenlerAppResizeWindow',
        params: {
          width: 1000,
          height: 651
        }
      }
    }

    sendMessage(data, window.parent);
  }, []);

  const isLoading = isLoadingRoom || isLoadingSprints || isLoadingEvents || isLoadingProject;

  if (isLoading) {
    return <Loader />;
  }

  if (isRoomError || isSprintsError || isEventsError || isProjectError) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        {isRoomError && <div>Ошибка загрузки комнаты: {roomError?.message}</div>}
        {isSprintsError && <div>Ошибка загрузки спринтов: {sprintsError?.message}</div>}
        {isEventsError && <div>Ошибка загрузки событий: {eventsError?.message}</div>}
        {isProjectError && <div>Ошибка загрузки проекта: {projectError?.message}</div>}
      </Box>
    );
  }

  if (!room) {
    return <Loader />;
  }

  return <RoomBox><Outlet /></RoomBox>;
}

export default function RoomRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/rooms/${slug}/setting`} replace />;
}

export const Navigation = () => {
  const { context } = getUrlParams()

  if (context === 'Bot_step') {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/redirect_auth" element={<RedirectAuthPage />} />

        <Route path="/" element={<ProtectedRoute><SelectActionPage /></ProtectedRoute>} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/redirect_auth" element={<RedirectAuthPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <RoomsPage />
        </ProtectedRoute>
      } />

      <Route path="rooms" element={
        <ProtectedRoute>
          <RoomsPage />
        </ProtectedRoute>
      }/>

      <Route path="rooms/:slug" element={
        <ProtectedRoute>
          <RoomLayout />
        </ProtectedRoute>
      }>
        <Route index element={<RoomRedirect />} />
        <Route path="setting" element={<SettingPage />} />
        <Route path="setting/info" element={<SettingsInfo />} />

        <Route index path="sprints" element={<SprintList />} />
        <Route path="sprints/:sprintId" element={<SprintSetting />} />
        <Route path="sprints/settings" element={<SprintSettingsPage />} />
        <Route path="sprints/info" element={<SprintInfo />} />

        <Route path="events" element={<EventsPage />} />
        <Route path="events/info" element={<EventsInfo />} />
        <Route path="events/:eventId" element={<EventsSetting />} />

        <Route path="statistics" element={<EventsPage />} />

        <Route path="*" element={<RoomRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
};

export const Logout = () => {
	const navigate = useNavigate()
  const { logout, setToken } = useAuthStore();

	useEffect(() => {
    setToken('')
    logout()
		setTimeout(() => {
			navigate('/auth')
		}, 300)
	})

	return <Loader classNameDiv='my-5'/>
}
