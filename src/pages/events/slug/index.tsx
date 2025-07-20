import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Link } from "react-router-dom";

interface SubscriberGroup {
  id: number;
  title: string;
  name: string;
  senlerId: number;
  isExcluded?: boolean;
}

const EventsSetting = () => {
  const { eventId } = useParams();
  const [eventName, setEventName] = useState("Конференция 2025");
  const [startDate, setStartDate] = useState("2025-02-01");
  const [endDate, setEndDate] = useState("2025-07-01");
  const [allowAfterCompletion, setAllowAfterCompletion] = useState(false);
  const [autoAddAmbassadors, setAutoAddAmbassadors] = useState(true);
  const [userReward, setUserReward] = useState(0);
  const [limitUsage, setLimitUsage] = useState(0);
  const [limitUsageEnabled, setLimitUsageEnabled] = useState(true);

  const subscriberGroups: SubscriberGroup[] = [
    {
      id: 1,
      title: "Группа подписчиков в Senler для подачи заявки участие в событии",
      name: "Заявки на событие ID: 4 | Конференция 2025",
      senlerId: 2353,
    },
    {
      id: 2,
      title: "Группа подписчиков в Senler для одобренных участников",
      name: "Участники события ID: 4 | Конференция 2025",
      senlerId: 2354,
    },
    {
      id: 3,
      title: "Группа подписчиков в Senler для исключенных участников",
      name: "Исключенные из события ID: 4 | Конференция 2025",
      senlerId: 2355,
      isExcluded: true,
    },
  ];

  return (
    <Box p={3}>
      {/* Breadcrumbs */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${eventId}/events`} underline="hover" color="inherit">
            Список событий
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {eventName}
          </Typography>
        </Breadcrumbs>
        <Typography variant="body2" sx={{ fontFamily: "monospace", ml: 2 }}>
          ID: 4
        </Typography>
      </Box>

      <Stack spacing={4}>
        {/* Settings Section */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Настройки
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Название *
              </Typography>
              <TextField
                fullWidth
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                variant="outlined"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" mb={1}>
                Дата *
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
                <Typography>-</Typography>
                <TextField
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={allowAfterCompletion}
                  onChange={(e) => setAllowAfterCompletion(e.target.checked)}
                />
              }
              label="Разрешить использование промокода после завершения"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={autoAddAmbassadors}
                  onChange={(e) => setAutoAddAmbassadors(e.target.checked)}
                />
              }
              label="Автоматически добавить в список амбассадоров"
            />

            <Box>
              <Typography variant="subtitle2" mb={1}>
                Награда для привлеченных пользователей
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="number"
                  value={userReward}
                  onChange={(e) => setUserReward(Number(e.target.value))}
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ minWidth: 80 }}>
                  <Select value="руб" size="small">
                    <MenuItem value="руб">руб</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>
                  Ограничить число использований каждого промокода
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="number"
                    value={limitUsage}
                    onChange={(e) => setLimitUsage(Number(e.target.value))}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body2">раз</Typography>
                </Stack>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={limitUsageEnabled}
                    onChange={(e) => setLimitUsageEnabled(e.target.checked)}
                  />
                }
                label=""
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Subscriber Groups */}
        {subscriberGroups.map((group) => (
          <Paper key={group.id} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              mb={2}
              color={group.isExcluded ? "error.main" : "text.primary"}
            >
              {group.title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", border: "2px dashed #ccc" }} />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {group.senlerId}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <MuiLink href="#" underline="hover" sx={{ cursor: "pointer" }}>
                редактированию группу
              </MuiLink>
              <MuiLink href="#" underline="hover" sx={{ cursor: "pointer" }}>
                список пользователей
              </MuiLink>
              <MuiLink href="#" underline="hover" sx={{ cursor: "pointer" }}>
                как использовать?
              </MuiLink>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default EventsSetting