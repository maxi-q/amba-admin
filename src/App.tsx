import { useState } from 'react'

import { Navigation } from './pages'
import { BrowserRouter } from 'react-router-dom'

export type IUser = object

function App() {
	const [loggedIn, setLoggedIn] = useState<boolean>(false)
	const [user, setUser] = useState<IUser | undefined>()

  console.log(loggedIn, user)

	return (
    <BrowserRouter>
      <Navigation setLoggedIn={setLoggedIn} setUser={setUser} />
    </BrowserRouter>
	)
}

export default App