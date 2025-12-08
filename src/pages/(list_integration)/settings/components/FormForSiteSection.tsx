import {
  Typography,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

interface FormForSiteSectionProps {
  roomId?: string;
  onCopy: (text: string) => void;
}

export const FormForSiteSection = ({ roomId, onCopy }: FormForSiteSectionProps) => {
  const installationCode = `<script async="" src="https://ambassador.sen.collabox.dev/index.js"></script>
<link href="https://ambassador.sen.collabox.dev/index.css" rel="stylesheet">`;

  const exampleCode = `<a href="#" onclick="openPromoAmbSEN(123, 'sdfsdfg4', ${roomId || 56})">Ввести промокод</a>`;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" mb={2}>Форма для сайта</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Код для установки на сайт
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Разместите код как можно ближе к началу страницы, Например, в пределах тегов &lt;head&gt;&lt;/head&gt; или &lt;body&gt;&lt;/body&gt;
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Это универсальный код, который подходит для всех комнат, его нужно вставить на сайт только один раз
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              multiline
              rows={8}
              fullWidth
              value={installationCode}
              variant="outlined"
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '14px' }
              }}
            />
            <IconButton
              onClick={() => onCopy(installationCode)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              color="primary"
            >
              <ContentCopy />
            </IconButton>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Код для вызова формы с вводом промокода
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 1 }}>
              openPromoAmbSEN(&lt;unique_id&gt;, &lt;security_code&gt;, &lt;room_id&gt;)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>unique_id</strong> - идентификатор, по которому нужно ограничивать повторное использование промокодов
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>security_code</strong> - секретный ключ для защиты запросов. Вы можете указать этот параметр, чтобы защитить использование промокодов от недобросовестных пользователей. Его нужно сгенерировать на сервере, чтобы защитить алгоритм его формирования. Например, можно использовать функцию md5, в которой зашифровать unique_id и придуманную вами строку, чтобы потом проверить в вебхуке данный параметр md5(unique_id+'45rtwtwb')
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>room_id</strong> - идентификатор комнаты. Текущий ID = {roomId || 'N/A'}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            Пример:
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              multiline
              rows={2}
              fullWidth
              value={exampleCode}
              variant="outlined"
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '14px' }
              }}
            />
            <IconButton
              onClick={() => onCopy(exampleCode)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              color="primary"
            >
              <ContentCopy />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

