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

const SprintInfo = () => {
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
        
        <Typography variant="h3" fontWeight={700} mb={3}>
          Что такое спринты?
        </Typography>
        
        <Stack spacing={3}>
          <Typography variant="body1">
            Спринт — это формат кампании с амбассадорами, где все участники из выбранной комнаты автоматически принимают участие, используя свой постоянный промокод. Такой формат идеально подходит для длительных или повторяющихся активностей с едиными условиями участия и вознаграждений.
          </Typography>
          
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              ⚙️Особенности спринта:
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                <Typography variant="body1">
                  <strong>Автоматическое участие:</strong> Все амбассадоры, добавленные в комнату, автоматически становятся участниками каждого активного спринта. Не требуется ручной отбор или приглашение.
                </Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                <Typography variant="body1">
                  <strong>Единый промокод:</strong> У каждого амбассадора есть один постоянный промокод, используемый во всех спринтах. Это упрощает отслеживание результатов и продвижение.
                </Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                <Typography variant="body1">
                  <strong>Фиксированные условия:</strong> Условия по вознаграждению (бонус пользователю и награда амбассадору) едины в рамках спринта и применяются ко всем участникам.
                </Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0, px: 0 }}>
                <Typography variant="body1">
                  <strong>Аналитика по периоду:</strong> Статистика привязывается ко времени действия спринта, что позволяет оценивать эффективность конкретного периода активности. Удобно для регулярных метрик и A/B-тестирования.
                </Typography>
              </ListItem>
            </List>
          </Box>
          
          <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Отличия Событий от Спринтов
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Формат участия:
                </Typography>
                <Typography variant="body1" mb={1}>
                  В спринтах участвуют все амбассадоры, добавленные в комнату, автоматически.
                </Typography>
                <Typography variant="body1">
                  В событиях вы вручную выбираете участников: добавляете всех или рассылаете персональные приглашения.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Промокоды:
                </Typography>
                <Typography variant="body1" mb={1}>
                  В спринтах у каждого амбассадора есть один постоянный промокод, который действует на протяжении всех спринтов.
                </Typography>
                <Typography variant="body1">
                  В событиях для каждого амбассадора создаётся уникальный промокод, привязанный к конкретному событию.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Условия вознаграждений:
                </Typography>
                <Typography variant="body1" mb={1}>
                  В спринтах действуют единые условия для всех участников.
                </Typography>
                <Typography variant="body1">
                  В событиях можно задавать индивидуальные условия: как для пользователя, так и для амбассадора.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Аналитика:
                </Typography>
                <Typography variant="body1" mb={1}>
                  В спринтах статистика собирается по активному по дате периоду (то есть по времени действия спринта).
                </Typography>
                <Typography variant="body1">
                  В событиях аналитика ведётся по каждому мероприятию отдельно — это позволяет видеть эффективность по каждому каналу привлечения и по каждому амбассадору.
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight={500} mb={1}>
                  Гибкость настройки:
                </Typography>
                <Typography variant="body1" mb={1}>
                  Спринты лучше подходят для рутинных, регулярных кампаний с минимальной настройкой.
                </Typography>
                <Typography variant="body1">
                  События дают максимум гибкости: подходят для конференций, коллабораций, временных акций, где важны индивидуальные условия и точная аналитика.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default SprintInfo;