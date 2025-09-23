import { useMessage } from "@/messages/messageProvider"
import { FormControl, Select, MenuItem } from "@mui/material"
import { useEffect, useState } from "react"

const SelectStatusPage = () => {
	const { message, sendMessage } = useMessage()
  const [status, setStatus] = useState('')

  const handleSetData = (mockMessage?: { private: any, public: any }) => {
    const { public: publicPayload } = mockMessage ? mockMessage : message.request.payload;

    const { status } = JSON.parse(publicPayload || '{}');
    setStatus(status)
  };

  const handleGetData = () => {
    const data = {
      id: message.id,
      request: message.request,
      response: {
        payload: {
          public: {
            status
          },
          description: 'Интеграция подключена',
          command: 'Генерация картинки',
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

  return (
    <>
    <FormControl fullWidth sx={{ mb: 2 }}>
      <Select
        value={status || ""}
        onChange={(e) => setStatus(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">
          <em>Выберите действие</em>
        </MenuItem>
        <MenuItem value="get_status">Получение статуса амбассадора</MenuItem>
        <MenuItem value="register">Регистрация амбассадора</MenuItem>
      </Select>
    </FormControl>
    </>
  )
}

export default SelectStatusPage