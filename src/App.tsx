import { MessageProvider } from './messages/messageProvider'
import { Navigation } from './pages'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import createRoomButtonTheme from './themes/createRoomButtonTheme';
import listItemTextTheme from './themes/listItemTextTheme';


const mergedTheme = createTheme(createRoomButtonTheme, listItemTextTheme);

function App() {
	// const [loggedIn, setLoggedIn] = useState<boolean>(false)
	// const [user, setUser] = useState<IUser | undefined>()

  // console.log(loggedIn, user)

  // {
  //   "id": 1753118427097,
  //   "request": {
  //     "type": "SenlerAppResizeWindow",
  //     "params": {
  //       "width": "1000",
  //       "height": "792"
  //     }
  //   }
  // }




	return (
    <MessageProvider>
      <ThemeProvider theme={mergedTheme}>
        <BrowserRouter>
          <Navigation />
        </BrowserRouter>
      </ThemeProvider>
    </MessageProvider>
	)
}

export default App