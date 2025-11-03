import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Loader } from "@components/Loader";
import { useAuthStore } from "@store/index";

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
