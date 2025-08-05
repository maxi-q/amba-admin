import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ExpandMore, Refresh } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useRoomDataStore } from "@store/index";
import { useDebouncedCallback } from 'use-debounce'; //  npm i use-debounce
import roomsService from "@services/rooms/rooms.service";

export default function SettingPage() {
  const { roomData } = useRoomDataStore();
  const { slug } = useParams();

  const [roomName, setRoomName] = useState(roomData?.name || '')
  const [webhookUrl, setWebhookUrl] = useState(roomData?.webhookUrl || '');
  const [secretKey, setSecretKey] = useState(roomData?.secretKey || '');

  const debouncedUpdate = useDebouncedCallback(
    (payload: {
      name: string;
      webhookUrl: string;
      secretKey: string;
      isHidden: false
    }, currentSlug: string) => {
      roomsService.updateRooms(payload, currentSlug);
    },
    500
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!slug) return;

    debouncedUpdate(
      { name: roomName, webhookUrl, secretKey, isHidden: false },
      slug
    );

    return debouncedUpdate.cancel;
  }, [roomName, webhookUrl, secretKey, slug]);

  if (!roomData) {
    return null;
  }

  const changeRoomName = (value: string) => {
    setRoomName(value);
  };

  const generateSecretKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSecretKey(newKey);
  };

  const saveWebhook = () => {
    console.log("Saving webhook:", webhookUrl);
  };

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      <Box mb={4}>
        <Typography variant="subtitle2" mb={1.5}>
          Название:
        </Typography>
        <TextField
          fullWidth
          value={roomName}
          onChange={(e) => changeRoomName(e.target.value)}
          size="medium"
          variant="outlined"
        />
      </Box>

      {/* Вебхук секция */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="webhook-content"
          id="webhook-header"
        >
          <Typography variant="h6">Вебхук</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" mb={1.5}>
              Адрес:
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                size="medium"
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={saveWebhook}
                sx={{ minWidth: 120 }}
              >
                Сохранить
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={3}>
              На этот адрес будут отправляться запросы после того как привлеченный пользователь активировал промокод
            </Typography>

            <Typography variant="subtitle2" mb={1.5}>
              Секретный ключ
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                size="medium"
                variant="outlined"
                type="password"
              />
              <IconButton onClick={generateSecretKey} color="primary">
                <Refresh />
              </IconButton>
            </Box>

            <Link
              component={RouterLink}
              to={`/rooms/${slug}/setting/info`}
              underline="hover"
              color="primary"
              sx={{ cursor: 'pointer' }}
            >
              описание формата вебхука
            </Link>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Форма для сайта секция */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="form-content"
          id="form-header"
        >
          <Typography variant="h6">Форма для сайта</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Здесь будет содержимое формы для сайта
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
