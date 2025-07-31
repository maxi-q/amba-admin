import { Edit as EditIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import { useRoomDataStore } from "@store/index";

type SprintStatus = "active" | "upcoming" | "past";

const statusColors: Record<SprintStatus, "success" | "warning" | "default"> = {
  active: "success",
  upcoming: "warning",
  past: "default",
};

const statusLabels: Record<SprintStatus, string> = {
  active: "активный",
  upcoming: "предстоящий",
  past: "прошедший",
};

export default function SprintList() {
  const { roomData } = useRoomDataStore()

  console.log(roomData?.sprints)

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={700} mb={0}>
          Список спринтов
        </Typography>
        <Box flex={1} />
        <Link to={'info'} style={{ textDecoration: 'underline', marginRight: 12, cursor: 'pointer' }}>
          подробнее
        </Link>
        <Link
          to="settings"
          style={{
            backgroundColor: 'var(--mui-palette-primary-main, #1976d2)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 500,
            display: 'inline-block'
          }}
        >
          Настройка спринтов
        </Link>
      </Stack>

      <Stack spacing={2}>
        {roomData?.sprints.map((sprint) => (
          <Paper
            key={sprint.id}
            component={Link}
            to={`${sprint.id}`}
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={500}>
                {sprint.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sprint.startDate + ' — ' + sprint.endDate || "Без ограничений по датам"}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip
                label={statusLabels.active}
                color={statusColors.active}
                size="small"
                sx={{ borderRadius: 1 }}
              />
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            sx={{
              bgcolor: 'success.50',
              borderColor: 'success.200',
              color: 'success.700',
              '&:hover': {
                bgcolor: 'success.100',
                borderColor: 'success.300',
              },
            }}
          >
            Добавить спринт
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
