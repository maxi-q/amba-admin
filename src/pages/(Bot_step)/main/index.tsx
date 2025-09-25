import { useMessage } from "@/messages/messageProvider"
import { FormControl, Select, MenuItem } from "@mui/material"
import { useEffect, useState } from "react"

const COMMANDS = {
  amba_status: 'Получение статуса амбассадора',
  amba_register: 'Регистрация амбассадора',

}
const SelectActionPage = () => {
	const { message, sendMessage } = useMessage()
  const [action, setAction] = useState<keyof typeof COMMANDS>('amba_status')

  const handleSetData = (mockMessage?: { private: any, public: any }) => {
    const { public: publicPayload } = mockMessage ? mockMessage : message.request.payload;

    const { action } = JSON.parse(publicPayload || '{}');
    if (action) setAction(action)
  };

  const handleGetData = () => {
    const data = {
      id: message.id,
      request: message.request,
      response: {
        payload: {
          public: {
            action
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
    if (!message) return;
    if (message.request?.type === 'getData') handleGetData();
    if (message.request?.type === 'setData') handleSetData();
  }, [message]);

  return (
    <>
    <FormControl fullWidth sx={{ mb: 2 }}>
      <Select
        value={action || ""}
        onChange={(e) => setAction(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">
          <em>Выберите действие</em>
        </MenuItem>
        <MenuItem value="amba_status">{COMMANDS.amba_status}</MenuItem>
        <MenuItem value="amba_register">{COMMANDS.amba_register}</MenuItem>
      </Select>
    </FormControl>
    </>
  )
}

export default SelectActionPage