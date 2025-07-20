import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
} from "@mui/material";

const SprintSetting = () => {
  const { sprintId, slug } = useParams();
  const [sprintName, setSprintName] = useState('Загрузка')

  useEffect(()=>{
    console.log(sprintId)
    setSprintName('Подготовка к конференции')
  }, [])

  return (
    <Box>
      <Box mb={3}>
        <Breadcrumbs separator=">" sx={{ fontSize: "0.875rem" }}>
          <MuiLink component={Link} to={`/rooms/${slug}/sprints`} underline="hover" color="inherit">
            Список спринтов
          </MuiLink>
          <Typography variant="body2" color="text.primary">
            {sprintName}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box p={3}>
        <Typography variant="h4" fontWeight={700} mb={2}>Настройки</Typography>
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Название
            </Typography>
            <TextField
              fullWidth
              placeholder="Будет показываться вам и определенным амбассадорам"
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" mb={1}>
              Ограничить спринт датами
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="date"
                defaultValue="2024-12-10"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <TextField
                type="date"
                defaultValue="2025-02-10"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <Checkbox />
            </Stack>
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>Промокоды</Typography>
            <Typography variant="body2" color="text.secondary" maxWidth="md">
              Для какого участка будет спеймерован уникальный промокод, который отправится при добавлении в группу амбассадоров, а также будет отправлен указанные ниже награды
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">
              Использование промокода доступно только в период проведения спринта
            </Typography>
            <Checkbox />
          </Stack>

          <Box>
            <Typography variant="subtitle2" mb={1}>
              Награда для приодленных пользователей
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="number"
                defaultValue="0"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                руб
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Ограничить число использования каждого промокода
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="number"
                  defaultValue="100"
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  раз
                </Typography>
              </Stack>
            </Box>
            <Checkbox />
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default SprintSetting