import { useMessage } from "@/messages/messageProvider"
import { FormControl, Select, MenuItem, Typography, Box } from "@mui/material"
import { useEffect, useState } from "react"
import roomsService from "@/services/rooms/rooms.service"
import type { IGetRoomResponse } from "@/services/rooms/rooms.types"

const COMMANDS = {
  amba_status: 'Получение статуса амбассадора',
  amba_register: 'Регистрация амбассадора',
  get_sprint_promo: 'Получить промокод для спринтов',

}
const SelectActionPage = () => {
	const { message, sendMessage } = useMessage()
  const [action, setAction] = useState<keyof typeof COMMANDS>('amba_status')
  const [rooms, setRooms] = useState<IGetRoomResponse[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('')

  const loadRooms = async () => {
    try {
      const response = await roomsService.getRooms()
      setRooms(response.data)
    } catch (error) {
      console.error('Ошибка при загрузке комнат:', error)
    }
  }

  const handleSetData = (mockMessage?: { private: any, public: any }) => {
    const { public: publicPayload } = mockMessage ? mockMessage : message.request.payload;

    const { action, roomId } = JSON.parse(publicPayload || '{}');
    if (action) setAction(action)
    if (roomId) setSelectedRoom(roomId)
  };

  const handleGetData = () => {
    const data = {
      id: message.id,
      request: message.request,
      response: {
        payload: {
          public: {
            action,
            roomId: selectedRoom
          },
          description: '',
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
    </>
  )
}

export default SelectActionPage