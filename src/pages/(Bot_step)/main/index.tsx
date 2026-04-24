import { useMessage } from "@/messages/messageProvider"
import {
  Alert,
  AlertDescription,
  Button,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui"
import { useEffect, useState } from "react"
import { useRooms } from "@/hooks/rooms/useRooms"
import { useEvents } from "@/hooks/events/useEvents"


const COMMANDS = {
  GET_AMBASSADOR_ROOM_STATUS: 'Получение статуса комнаты амбассадора',
  GET_EVENT_INFO_AND_AMBASSADOR_STATUS: 'Получение информации события и статуса амбассадора',
  GET_AMBASSADOR_BASE_PROMO_CODE: 'Получение промокода амбассадора',
  GET_AMBASSADOR_EVENT_PROMO_CODE: 'Получение промокода события амбассадора',
  REGISTER_AND_ADD_AMBASSADOR_TO_ROOM: 'Регистрация амбассадора',
  SET_AMBASSADOR_BASE_PROMO_CODE: 'Установка нового промокода амбассадора',
} as const

const NO_ROOM = "__no_room__"
const NO_EVENT = "__no_event__"

interface ISelectActionPageProps {
  action?: keyof typeof COMMANDS
  settings?: {
    roomId?: string
    eventId?: string
  }
}

export const SelectActionPage = () => {
  const { message, sendMessage } = useMessage()
  const [action, setAction] = useState<keyof typeof COMMANDS>('GET_AMBASSADOR_ROOM_STATUS')
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<string>('')

  const {
    rooms,
    isLoading: isLoadingRooms,
    isError: isRoomsError,
    error: roomsError
  } = useRooms()

  const {
    events
  } = useEvents({ page: 1, size: 100 }, selectedRoom)

  const handleSetData = (mockMessage?: { private: any, public: any }) => {
    const { public: publicPayload } = mockMessage ? mockMessage : message.request.payload;

    const parsed: ISelectActionPageProps = JSON.parse(publicPayload || '{}');
    if (parsed.action) setAction(parsed.action as keyof typeof COMMANDS)
    if (parsed.settings?.roomId) setSelectedRoom(parsed.settings.roomId)
    if (parsed.settings?.eventId) setSelectedEvent(parsed.settings.eventId)
  };

  const handleGetData = () => {
    const publicPayload: ISelectActionPageProps = {
      action,
      settings: {
        roomId: selectedRoom,
      }
    };

    if ((action === 'GET_EVENT_INFO_AND_AMBASSADOR_STATUS' || action === 'GET_AMBASSADOR_EVENT_PROMO_CODE') && selectedEvent && publicPayload.settings) {
      publicPayload.settings.eventId = selectedEvent;
    }

    const data = {
      id: message.id,
      request: message.request,
      response: {
        payload: {
          public: publicPayload,
          description: rooms.find(el => el.id === selectedRoom)?.name,
          command: COMMANDS[action],
          title: 'title',
        },
        success: true,
      },
      time: new Date().getTime(),
    };

    sendMessage(data, window.parent);
  };


  useEffect(() => {
    if (!message) return;
    if (message.request?.type === 'getData') handleGetData();
    if (message.request?.type === 'setData') handleSetData();
  }, [message]);

  if (isLoadingRooms) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomsError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Ошибка при загрузке комнат: {roomsError?.message || 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Комната:</p>
        {rooms && rooms.length > 0 ? (
          <Select
            value={selectedRoom || NO_ROOM}
            onValueChange={(v) => setSelectedRoom(v === NO_ROOM ? '' : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите комнату" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ROOM}>
                <span className="text-muted-foreground">Выберите комнату</span>
              </SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">
            <em>Комнаты не найдены</em>
          </p>
        )}
      </div>

      {selectedRoom && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Действие:</p>
          <Select
            value={action}
            onValueChange={(v) => setAction(v as keyof typeof COMMANDS)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите действие" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMMANDS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedRoom && (action === 'GET_EVENT_INFO_AND_AMBASSADOR_STATUS' || action === 'GET_AMBASSADOR_EVENT_PROMO_CODE') && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Событие:</p>
          {events.length > 0 ? (
            <Select
              value={selectedEvent || NO_EVENT}
              onValueChange={(v) => setSelectedEvent(v === NO_EVENT ? '' : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите событие" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_EVENT}>
                  <span className="text-muted-foreground">Выберите событие</span>
                </SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Нет созданных событий
            </p>
          )}
        </div>
      )}
    </div>
  )
}
