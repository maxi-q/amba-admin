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

type SprintStatus = "active" | "upcoming" | "past";

type Sprint = {
  id: number;
  title: string;
  dateRange?: string;
  status: SprintStatus;
};

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

const defaultSprints: Sprint[] = [
  {
    id: 1,
    title: "Подготовка к конференции",
    dateRange: "Без ограничений по датам",
    status: "active",
  },
  {
    id: 2,
    title: "Ретроспектива",
    dateRange: "10–15 августа 2025",
    status: "past",
  },
  {
    id: 3,
    title: "Промежуточный анализ",
    dateRange: "20–25 августа 2025",
    status: "upcoming",
  },
];

export default function SprintList({ sprints = defaultSprints }: { sprints?: Sprint[] }) {
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
        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
          Настройка спринтов
        </Box>
      </Stack>

      <Stack spacing={2}>
        {sprints.map((sprint) => (
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
                {sprint.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sprint.dateRange || "Без ограничений по датам"}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip
                label={statusLabels[sprint.status]}
                color={statusColors[sprint.status]}
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
