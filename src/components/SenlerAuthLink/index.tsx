export interface IOnAuthSuccess {
  code: string
}

interface AmoAuthPopupProps {
	clientId: string
	redirectUri: string
	state?: string
  group_id: string
	onAuthSuccess: ({ code }: IOnAuthSuccess) => void
	onAuthError?: (error: string) => void
}

const SenlerAuthLink = ({
	clientId,
	redirectUri,
  group_id,
	onAuthSuccess,
	onAuthError,
}: AmoAuthPopupProps) => {
	const generateAuthUrl = () => {
		const authUrl = new URL('https://senler.ru/cabinet/OAuth2authorize')
		authUrl.searchParams.append('group_id', group_id)
		authUrl.searchParams.append('client_id', clientId)
		authUrl.searchParams.append('redirect_uri', redirectUri)
		authUrl.searchParams.append('state', ''+Date.now())

		return authUrl.toString()
	}

	const openAuthPopup = () => {
		const authUrl = generateAuthUrl()
		const popup = window.open(authUrl, 'senlerAuthPopup', 'width=600,height=600')

		if (!popup) {
			onAuthError?.(
				'Не удалось открыть всплывающее окно. Возможно, оно заблокировано.'
			)
			return
		}

		const timer = setInterval(() => {
			if (popup.closed) {
				clearInterval(timer)
				console.error(
					'Авторизация отменена пользователем или всплывающее окно было закрыто.'
				)
				return
			}

			try {
				const urlParams = new URLSearchParams(popup.location.search)
				const code = urlParams.get('code')

				if (code) {
					onAuthSuccess({ code })
					popup.close()
					clearInterval(timer)
				}

			} catch (error) {
        console.error(error)
			}
		}, 500)
	}

	return (
		<div className="accounts_dropdown flex justify-start p-3 flex-row" onClick={openAuthPopup}>
			<div className="flex items-center ">
				<div className="ms-2">
					<span data-role="header_account_text">Получить токен Senler</span>
				</div>
			</div>
		</div>
	)
}

export default SenlerAuthLink