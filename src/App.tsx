import { MessageProvider } from './messages/messageProvider'
import { Navigation } from './pages'
import { BrowserRouter } from 'react-router-dom'

export type IUser = object

function App() {
	// const [loggedIn, setLoggedIn] = useState<boolean>(false)
	// const [user, setUser] = useState<IUser | undefined>()

  // console.log(loggedIn, user)

	return (
    <MessageProvider>
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    </MessageProvider>
	)
}

export default App