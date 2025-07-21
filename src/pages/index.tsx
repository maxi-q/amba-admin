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
import { useAuthStore } from '@store/index';
import { useEffect } from 'react';
import { Loader } from '../components/Loader';
import { useMessage } from '@/messages/messageProvider';

// type NavigationType = {
// 	setUser: React.Dispatch<React.SetStateAction<object | undefined>>
// 	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
// }

export interface IRoomData {
  roomName: string;
  groups: {
      id: number,
      title: string,
      name: string,
      senlerId: number,
      link: string,
      instructions: string[],
    }[],
}
function RoomLayout() {

  const { sendMessage } = useMessage()

  useEffect(() => {
    // const data = {
    //   id: message.id,
    //   request: message.request,
    //   response: {
    //     payload: {
    //       private: { ...privateData },
    //       public: {
    //         ...publicData,
    //         token: '',
    //         vkGroupId,
    //         type: stepType,
    //         syncableVariables,
    //       },
    //       description: 'Интеграция подключена',
    //       command: BotStepRuName[stepType],
    //       title: BotStepRuName[stepType],
    //     },
    //     success: true,
    //   },
    //   time: new Date().getTime(),
    // };


    const data = {
      id: new Date().getTime(),
      request: {
        type: 'SenlerAppResizeWindow',
        params: {
          width: '1000',
          height: '792'
        }
      }
    }

    sendMessage(data, window.parent);
  }, []);

  const roomData: IRoomData = {
    roomName: 'Конференция суровый маркетинг 2025',
    groups: [
      {
        id: 1,
        title: "Группа подписчиков в Senler для подачи заявки в амбассадорку",
        name: "Заявки амбассадоры: Конференция суровый маркетинг 2025",
        senlerId: 123456,
        link: "https://vk.com/app5898182_-103213116#s=2580611",
        instructions: [
          "Отправить прямую ссылку на группу подписчиков:",
          "Сделать рассылку через бота с предложением об участии и кнопкой \"Принять\" (при нажатии на которую вызвать действие добавления в группу)",
          "Самостоятельно добавить участников в группу подписчиков в кабинете Senler",
          "И так далее. Варианты ограничиваются только вашей фантазией…",
        ],
      },
      {
        id: 2,
        title: "Группа подписчиков в Senler для одобренных амбассадоров",
        name: "Одобренные амбассадоры: Конференция суровый маркетинг 2025",
        senlerId: 123456,
        link: "https://vk.com/app5898182_-103213116#s=2580611",
        instructions: [
          "Добавляйте в данную группу одобренных амбассадоров, чтобы они смогли принять участие.",
          "Если вы хотите принимать без амбассадоров без процесса одобрения, организуйте подписку на данную группу минуя группу с заявками.",
          "Прямая ссылка на вступление в данную группу минуя процесс одобрения:",
        ],
      },
      {
        id: 3,
        title: "Группа подписчиков в Senler для исключенных амбассадоров",
        name: "Исключенные амбассадоры: Конференция суровый маркетинг 2025",
        senlerId: 123456,
        link: "https://vk.com/app5898182_-103213116#s=2580611",
        instructions: [
          "В данной группе можно сохранять исключенных амбассадоров, чтобы автоматически отключать их участие в комнате.",
          "Вступление будет отключаться из группы с заявками и одобренными амбассадорами.",
        ],
      },
    ]
  }

  return <RoomBox roomName={roomData.roomName}><Outlet context={roomData}/></RoomBox>;
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

      <Route index path="sprints" element={<SprintList />} />
      <Route path="sprints/:sprintId" element={<SprintSetting />} />
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
