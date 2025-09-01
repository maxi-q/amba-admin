import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Stack,
  Paper,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EventsInfo = () => {
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
          Что такое события?
        </Typography>
        
        <Stack spacing={3}>
          <Typography variant="body1">
            События — это функция, которая позволяет создавать разовые активности. Под каждое событие автоматически создаются уникальные промокоды для каждого амбассадора.
          </Typography>
          
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              В событиях вы можете:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                <Typography variant="body1">
                  Назначить индивидуальные условия вознаграждений — бонус по промокоду для пользователя и награду амбассадору;
                </Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                <Typography variant="body1">
                  Набрать амбассадоров под конкретное событие — добавить всех амбассадоров из комнаты или отправить персонализированное приглашение с предложением принять участие.
                </Typography>
              </ListItem>
            </List>
          </Box>
          
          <Typography variant="body1">
            События хорошо подходят для конференций, коллабораций и ограниченных по времени акций, где важна гибкость в настройке и аналитика по конкретному событию.
          </Typography>
          
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Отличия от Спринтов:
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Промокоды:
                </Typography>
                <Typography variant="body1" mb={1}>
                  Во всех спринтах амбассадор использует свой один промокод.
                </Typography>
                <Typography variant="body1">
                  Под каждое событие амбассадору создается отдельный промокод.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Участники:
                </Typography>
                <Typography variant="body1" mb={1}>
                  В каждом спринте автоматически участвуют все амбассадоры, добавленные в комнату.
                </Typography>
                <Typography variant="body1">
                  В событиях вы подбираете участников под каждое новое событие — либо добавляете всех, либо рассылаете приглашения.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Статистика:
                </Typography>
                <Typography variant="body1">
                  В спринтах статистика привязывается к активному по дате спринту, а в событиях — к конкретному мероприятию и конкретному амбассадору по промокоду, это позволяет показывать аналитику по каналам привлечения событиям.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default EventsInfo;