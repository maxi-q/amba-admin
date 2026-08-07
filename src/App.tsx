import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { MessageProvider } from './messages/messageProvider'
import { Navigation } from './pages/modules/Navigation'

import { Toaster } from 'sonner'

function App() {
	const [client] = useState(() => new QueryClient())
	const router = useMemo(
		() =>
			createBrowserRouter([
				{
					path: '*',
					element: (
						<>
							<Navigation />
							<Toaster position="top-right" richColors />
						</>
					),
				},
			]),
		[]
	)

	return (
		<MessageProvider>
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</MessageProvider>
	)
}

export default App
