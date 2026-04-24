import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { useState } from 'react';

import { MessageProvider } from './messages/messageProvider'
import { Navigation } from './pages/modules/Navigation'

import { Toaster } from 'sonner';

function App() {
	const [client] = useState(new QueryClient())

	return (
    <MessageProvider>
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <Navigation />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </MessageProvider>
	)
}

export default App
