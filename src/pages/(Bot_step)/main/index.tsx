import { useMessage } from "@/messages/messageProvider"
import { FormControl, Select, MenuItem, Typography, Box, Alert, Button } from "@mui/material"
import { useEffect, useState } from "react"
import { useRooms } from "@/hooks/rooms/useRooms"
import { useEvents } from "@/hooks/events/useEvents"
import { Loader } from "@/components/Loader"

const COMMANDS = {
  REGISTER_AMBASSADOR: 'Регистрация амбассадора',
  CHECK_AMBASSADOR_STATUS: 'Получение статуса амбассадора',
  SET_BASE_PROMO_CODE: 'Установить базовый промокод',
  GET_BASE_PROMO_CODE: 'Получить базовый промокод',
  GET_EVENT_PROMO_CODE: 'Получить промокод события',
}

interface ISelectActionPageProps {
  roomId: string
  action: keyof typeof COMMANDS
  eventId?: string
}

const SelectActionPage = () => {
	const { message, sendMessage } = useMessage()
  const [action, setAction] = useState<keyof typeof COMMANDS>('CHECK_AMBASSADOR_STATUS')
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
    if (action === 'GET_EVENT_PROMO_CODE' && selectedEvent) {
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
    if (!message) return;
    if (message.request?.type === 'getData') handleGetData();
    if (message.request?.type === 'setData') handleSetData();
  }, [message]);

  // Показываем загрузку
  if (isLoadingRooms) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Loader />
      </Box>
    );
  }

  // Показываем ошибку
  if (isRoomsError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке комнат: {roomsError?.message || 'Неизвестная ошибка'}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

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

            {rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <em>Комнаты не найдены</em>
              </MenuItem>
            )}
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

      {selectedRoom && action === 'GET_EVENT_PROMO_CODE' && (
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