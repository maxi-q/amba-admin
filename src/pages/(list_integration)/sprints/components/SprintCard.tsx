import { Box, Paper, Stack, Typography, Chip, IconButton } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import type { ISprint } from "@services/sprints/sprints.types";
import { formatDateRange, isSprintActive } from "../utils/sprintUtils";
import { checkSprintStatus } from "../constants/sprintStatus";

interface SprintCardProps {
  sprint: ISprint;
}

export const SprintCard = ({ sprint }: SprintCardProps) => {
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
  const active = isSprintActive(sprint.startDate, sprint.endDate);
  const { label, color } = checkSprintStatus(sprint.startDate, sprint.endDate);

  return (
    <Paper
      component={Link}
      to={`${sprint.id}`}
      sx={{
        p: 2,
        borderRadius: 3,
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: sprint.isDeleted ? 0.6 : 1,
        bgcolor: sprint.isDeleted ? 'grey.50' : 'background.paper',
        '&:hover': {
          bgcolor: sprint.isDeleted ? 'grey.100' : 'action.hover',
        },
      }}
    >
      <Box>
        <Typography
          variant="h6"
          fontWeight={500}
          mb={1}
          sx={{
            textDecoration: sprint.isDeleted ? 'line-through' : 'none',
            color: sprint.isDeleted ? 'text.disabled' : 'inherit',
          }}
        >
          {sprint.name}
        </Typography>
        <Typography
          variant="body2"
          color={sprint.isDeleted ? "text.disabled" : (active ? "success.main" : "text.secondary")}
          fontWeight={active ? 500 : 400}
          sx={{
            textDecoration: sprint.isDeleted ? 'line-through' : 'none',
          }}
        >
          {dateRange}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" spacing={2}>
        {!sprint.isDeleted && (
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ borderRadius: 1 }}
          />
        )}
        <IconButton size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
};

