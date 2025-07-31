import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute';

import SettingPage from './settings'
import RoomsPage from './rooms'
import RoomBox from './modules';
import SprintList from './sprints';
import SprintSetting from './sprints/slug';
import SprintInfo from './sprints/info';
import EventsPage from './events';
import EventsInfo from './events/info';
import EventsSetting from './events/slug';
import AuthPage from './auth';
import RedirectAuthPage from './redirect_auth';
import { useAuthStore, useRoomDataStore } from '@store/index';
import { useEffect } from 'react';
import { Loader } from '../components/Loader';
import { useMessage } from '@/messages/messageProvider';
import SprintSettingsPage from './sprints/settings';
import SettingsInfo from './settings/info';
import roomsService from '@services/rooms/rooms.service';

// type NavigationType = {
// 	setUser: React.Dispatch<React.SetStateAction<object | undefined>>
// 	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
// }

function RoomLayout() {
  const { slug } = useParams();
  const { sendMessage } = useMessage()
  const { setRoomData, roomData, setIsLoading, isLoading } = useRoomDataStore()

  useEffect(() => {
    const data = {
      request: {
        type: 'SenlerAppResizeWindow',
        params: {
          width: 1000,
          height: 792
        }
      }
    }

    sendMessage(data, window.parent);
  }, []);

  useEffect(() => {
    const getRoomData = async () => {
      setIsLoading(true)
      const roomData = await roomsService.getRoomById(slug!)
      setRoomData(roomData.data || null);
      setIsLoading(false)
    }

    getRoomData();
  }, [slug]);

  if (!roomData || isLoading) {
    return <Loader />;
  }

  return <RoomBox roomName={roomData.name}><Outlet /></RoomBox>;
}

export default function RoomRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/rooms/${slug}/setting`} replace />;
}

export const Navigation = () => (
  <Routes>
    {/* Публичный роут для авторизации */}
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/redirect_auth" element={<RedirectAuthPage />} />

    {/* Защищенные роуты */}
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
      <Route path="*" element={<RoomRedirect />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

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
