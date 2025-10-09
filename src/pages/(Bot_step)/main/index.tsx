import { useMessage } from "@/messages/messageProvider"
import { FormControl, Select, MenuItem, Typography, Box } from "@mui/material"
import { useEffect, useState } from "react"
import roomsService from "@/services/rooms/rooms.service"
import eventsService from "@/services/events/events.service"
import type { IGetRoomResponse } from "@/services/rooms/rooms.types"
import type { IEvent } from "@/services/events/events.types"

const COMMANDS = {
  amba_status: 'Получение статуса амбассадора',
  amba_register: 'Регистрация амбассадора',
  set_sprint_promo: 'Установить базовый промокод',
  get_sprint_promo: 'Получить базовый промокод',
  get_event_promo: 'Получить промокод события',
}

interface ISelectActionPageProps {
  roomId: string
  action: string
  eventId?: string
}

const SelectActionPage = () => {
	const { message, sendMessage } = useMessage()
  const [action, setAction] = useState<keyof typeof COMMANDS>('amba_status')
  const [rooms, setRooms] = useState<IGetRoomResponse[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [events, setEvents] = useState<IEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')

  const loadRooms = async () => {
    try {
      const response = await roomsService.getRooms()
      setRooms(response.data)
    } catch (error) {
      console.error('Ошибка при загрузке комнат:', error)
    }
  }

  const loadEvents = async (roomId: string) => {
    try {
      const response = await eventsService.getEvents({ page: 1, size: 100 }, roomId)
      setEvents(response.data.items)
    } catch (error) {
      console.error('Ошибка при загрузке событий:', error)
      setEvents([])
    }
  }

  const handleSetData = (mockMessage?: { private: any, public: any }) => {
    const { public: publicPayload } = mockMessage ? mockMessage : message.request.payload;

    const { action, roomId, eventId }: ISelectActionPageProps = JSON.parse(publicPayload || '{}');
    if (action) setAction(action as keyof typeof COMMANDS)
    if (roomId) setSelectedRoom(roomId)
    if (eventId) setSelectedEvent(eventId)
  };

  const handleGetData = () => {
    const publicPayload: ISelectActionPageProps = {
      action,
      roomId: selectedRoom
    };

    // Добавляем eventId только если выбрана команда get_event_promo и есть выбранное событие
    if (action === 'get_event_promo' && selectedEvent) {
      publicPayload.eventId = selectedEvent;
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
    loadRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      loadEvents(selectedRoom)
    } else {
      setEvents([])
    }

    setSelectedEvent('')
  }, [selectedRoom])

  useEffect(() => {
    if (!message) return;
    if (message.request?.type === 'getData') handleGetData();
    if (message.request?.type === 'setData') handleSetData();
  }, [message]);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          Комната:
        </Typography>
        <FormControl fullWidth>
           <Select
             value={selectedRoom || ""}
             onChange={(e) => setSelectedRoom(e.target.value)}
             displayEmpty
           >
             {!selectedRoom && (
               <MenuItem value="">
                 <em>Выберите комнату</em>
               </MenuItem>
             )}

            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedRoom && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Действие:
          </Typography>
          <FormControl fullWidth>
             <Select
               value={action || ""}
               onChange={(e) => setAction(e.target.value)}
               displayEmpty
             >
               {!action && (
                 <MenuItem value="">
                   <em>Выберите действие</em>
                 </MenuItem>
               )}
              {Object.entries(COMMANDS).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {selectedRoom && action === 'get_event_promo' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Событие:
          </Typography>
          {events.length > 0 ? (
            <FormControl fullWidth>
               <Select
                 value={selectedEvent || ""}
                 onChange={(e) => setSelectedEvent(e.target.value)}
                 displayEmpty
               >
                 {!selectedEvent && (
                   <MenuItem value="">
                     <em>Выберите событие</em>
                   </MenuItem>
                 )}
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              Нет созданных событий
            </Typography>
          )}
        </Box>
      )}
    </>
  )
}

export default SelectActionPage