import { createContext } from 'react'
import { MessageTypes } from '../types/messages.enum'

export type MessageType = { type: keyof typeof MessageTypes; payload: any }

interface MessageContextProps {
	message: any | null
	sendMessage: (message: any, target?: Window, origin?: string) => void
}

export const MessageContext = createContext<MessageContextProps | undefined>(
	undefined
)
