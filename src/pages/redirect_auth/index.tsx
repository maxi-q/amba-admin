import { useEffect } from 'react'
import { useMessage } from '@/messages/messageProvider'
import { MessageTypes } from '@/messages/types/messages.enum'
import { Card, CardContent, CardHeader, CardTitle } from '@senler/ui';
import { Loader2 } from 'lucide-react';

export const RedirectAuthPage = () => {
	const { sendMessage } = useMessage()

	useEffect(() => {
		try {
			const params = new URLSearchParams(window.location.search)
			const code = params.get('code') || ''
			const state = params.get('state') || ''
			const referer = params.get('referer') || ''
			const error = params.get('error') || ''

			if (error) {
				sendMessage(
					{ type: MessageTypes.AmoAuthCodeError, payload: { error } },
					window.opener || window.parent
				)
				window.close()
				return
			}

			if (code) {
				sendMessage(
					{ type: MessageTypes.AmoAuthCode, payload: { code, state, referer } },
					window.opener || window.parent
				)
				window.close()
			}
		} catch {
			sendMessage(
				{ type: MessageTypes.AmoAuthCodeError, payload: { error: 'Failed to parse auth params' } },
				window.opener || window.parent
			)
			window.close()
		}
	}, [])

	return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-2"
      style={{ background: '#428bca' }}
    >
      <Card className="w-full max-w-md border border-white/20 bg-white/95 text-center shadow-lg backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex justify-center" aria-hidden>
            <Loader2
              className="size-14 text-primary animate-spin"
              strokeWidth={2.5}
            />
          </div>
          <CardTitle className="text-xl font-semibold">
            Ожидание перенаправления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
            Пожалуйста, подождите, пока происходит перенаправление…
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
