import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useState } from 'react';

import { MessageProvider } from './messages/messageProvider'
import { Navigation } from './pages/modules/Navigation'
import createRoomButtonTheme from './themes/createRoomButtonTheme';
import listItemTextTheme from './themes/listItemTextTheme';

import { Toaster } from 'sonner';

import Image from 'next';

const mergedTheme = createTheme(createRoomButtonTheme, listItemTextTheme);

function App() {
	const [client] = useState(new QueryClient())

	return (
    <MessageProvider>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={mergedTheme}>
          <BrowserRouter>
            <Navigation />
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </MessageProvider>
	)
}

export default App