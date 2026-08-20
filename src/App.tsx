import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { MessageProvider } from './messages/messageProvider'
import { Navigation } from './pages/modules/Navigation'

import { Toaster } from 'sonner'

interface AppProps {
	initialPath?: string
}

function App({ initialPath }: AppProps) {
	const [client] = useState(() => new QueryClient())
	const router = useMemo(
		() => {
			const routes = [
				{
					path: '*',
					element: (
						<>
							<Navigation />
							<Toaster position="top-right" richColors />
						</>
					),
				},
			]

			return initialPath
				? createMemoryRouter(routes, { initialEntries: [initialPath] })
				: createBrowserRouter(routes)
		},
		[initialPath]
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
