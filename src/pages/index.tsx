import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'

import SettingPage from './settings'
import RoomsPage from './rooms'
import RoomBox from './modules';
import SprintList from './sprints';
import SprintSetting from './sprints/slug';
import SprintInfo from './sprints/info';

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
    <Route path="/" element={<RoomsPage />} />

    <Route path="rooms" element={<RoomsPage />}/>

    <Route path="rooms/:slug" element={<RoomLayout />}>
      <Route index element={<RoomRedirect />} />
      <Route path="setting" element={<SettingPage />} />

      <Route index path="sprints" element={<SprintList />} />
      <Route path="sprints/:sprintId" element={<SprintSetting />} />
      <Route path="sprints/info" element={<SprintInfo />} />

      <Route path="events" element={<>events</>} />
      <Route path="*" element={<RoomRedirect />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// const Logout = ({ setLoggedIn }: NavigationType) => {
// 	const navigate = useNavigate()
// 	useEffect(() => {
// 		localStorage.setItem('access', '')
// 		setTimeout(() => {
// 			setLoggedIn(false)
// 			navigate('Auth')
// 		}, 300)
// 	})

// 	return <Loader classNameDiv='my-5'/>
// }
