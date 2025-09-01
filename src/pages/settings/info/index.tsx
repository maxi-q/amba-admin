import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SettingsInfo = () => {
  const navigate = useNavigate();

  return (
    <Paper elevation={0} sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      bgcolor: 'white',
      display: 'flex',
      justifyContent: 'center',
      overflow: 'auto'
    }}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, width: '100%' }}>
        <Box mb={2}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Typography variant="h4" fontWeight={700} mb={3}>
          Формат вебхука
        </Typography>
        
        <Stack spacing={4}>
          {/* Формат запроса */}
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Формат запроса
            </Typography>
            
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
              <Typography variant="body1" fontWeight={500} mb={1}>
                Тип запроса: POST / JSON
              </Typography>
              
              <Typography variant="h6" fontWeight={600} mb={2}>
                Параметры:
              </Typography>
              
              <List sx={{ pl: 2 }}>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>channel_id: int</code> — идентификатор канала в Senler
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>room_id: int</code> — идентификатор комнаты. Текущий ID = 56
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>sprint_id: int</code> — идентификатор спринта
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>ambassador_id: string</code> — идентификатор амбассдора (id ВКонтакте или в Телеграмме)
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>secret: string</code> — секретный ключ для безопасности (находится в комнате)
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>action: enum('promocode_activate')</code> — действие
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>unique_id: int</code> — идентификатор, по которому нужно ограничивать повторное использование промокодов, передается в форму ввода промокода на сайте. В случае сенлера тут нужно передать ID проекта
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>security_code:</code> — генерируется сайтом для возможности сделать защиту, передается в форму ввода промокода
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                  <Typography variant="body1" component="span">
                    <code>data:</code> object:
                  </Typography>
                  <List sx={{ pl: 4, mt: 1 }}>
                    <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                      <Typography variant="body1" component="span">
                        <code>value: string</code> — промокод
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                      <Typography variant="body1" component="span">
                        <code>reward:</code> object:
                      </Typography>
                      <List sx={{ pl: 4, mt: 1 }}>
                        <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                          <Typography variant="body1" component="span">
                            <code>type: enum('fix')</code> — тип награды
                          </Typography>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                          <Typography variant="body1" component="span">
                            <code>value: int</code> — размер награды
                          </Typography>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                          <Typography variant="body1" component="span">
                            <code>units: string</code> — единицы измерения награды, например 'руб'
                          </Typography>
                        </ListItem>
                      </List>
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </Box>
          </Box>

          <Divider />

          {/* Успешная обработка */}
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Успешная обработка
            </Typography>
            <Typography variant="body1" mb={2}>
              При успешном начислении награды на вебхук необходимо ответить:
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
              <Typography variant="body1" component="pre" sx={{ fontFamily: 'monospace', m: 0 }}>
{`{
  "success": true
}`}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Ошибка обработки */}
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Ошибка обработки
            </Typography>
            <Typography variant="body1" mb={2}>
              Если произошла ошибка, то отправить текст этой ошибки в формате:
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
              <Typography variant="body1" component="pre" sx={{ fontFamily: 'monospace', m: 0 }}>
{`{
  "success": false,
  "error": "Текст ошибки"
}`}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default SettingsInfo;