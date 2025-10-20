import { useEffect } from 'react'
import { useMessage } from '@/messages/messageProvider'
import { MessageTypes } from '@/messages/types/messages.enum'
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

const RedirectAuthPage = () => {
	const { sendMessage } = useMessage()

	useEffect(() => {
		try {
      console.log(window.opener, window.parent)
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        background: '#428bca',
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          p: 6, 
          borderRadius: 3, 
          maxWidth: 450, 
          width: '100%', 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: 'primary.main',
            mb: 3,
          }} 
        />
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Ожидание перенаправления
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: 300,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Пожалуйста, подождите, пока происходит перенаправление...
        </Typography>
      </Paper>
    </Box>
  )}

export default RedirectAuthPage;