import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'

import { Loader } from '@components/Loader'
import { useEffect } from 'react'
import SettingPage from './settings'
import RoomsPage from './rooms'

type NavigationType = {
	setUser: React.Dispatch<React.SetStateAction<object | undefined>>
	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
}

function RoomLayout() {
  return <Outlet />; // сюда будут подставляться вложенные маршруты
}

export const Navigation = () => (
  <Routes>
    <Route path="/" element={<RoomsPage />} />

    <Route path="rooms/:slug" element={<RoomLayout />}>
      {/* /rooms/:slug/setting */}
      <Route path="setting" element={<SettingPage />} />
      {/* если /rooms/:slug/ без дополнительного сегмента — можно кинуть редирект */}
      <Route index element={<Navigate to="setting" replace />} />
      {/* любой другой хвост после /rooms/:slug/ */}
      <Route path="*" element={<Navigate to="setting" replace />} />
    </Route>

    {/* все неизвестные пути */}
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
