import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Collapse
} from "@mui/material";
import { Edit as EditIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from "@mui/icons-material";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import { formatDateRange, isTaskActive } from "../utils/creativetaskUtils";
import { TaskSubmissionsList } from "./TaskSubmissionsList";
import { PRIMARY_COLOR } from "@/constants/colors";

interface CreativeTaskCardProps {
  task: ICreativeTask;
  onEdit: (task: ICreativeTask) => void;
}

/**
 * Карточка креативной задачи: заголовок, описание, даты, статус.
 * Раскрывающийся блок с заявками (useSubmissions).
 */
export function CreativeTaskCard({ task, onEdit }: CreativeTaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const dateRange = formatDateRange(task.startsAt, task.endsAt);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        opacity: task.isDeleted ? 0.6 : 1,
        bgcolor: task.isDeleted ? "grey.50" : "background.paper",
        border: active ? "2px solid" : "1px solid",
        borderColor: active ? "success.main" : "divider",
        "&:hover": {
          bgcolor: task.isDeleted ? "grey.100" : "action.hover"
        }
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={500}
            mb={1}
            sx={{
              textDecoration: task.isDeleted ? "line-through" : "none",
              color: task.isDeleted ? "text.disabled" : "inherit"
            }}
          >
            {task.title}
          </Typography>
          <Typography
            variant="body2"
            color={task.isDeleted ? "text.disabled" : "text.secondary"}
            sx={{
              textDecoration: task.isDeleted ? "line-through" : "none",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {task.description || "—"}
          </Typography>
          <Typography
            variant="body2"
            color={task.isDeleted ? "text.disabled" : active ? "success.main" : "text.secondary"}
            fontWeight={active ? 500 : 400}
            sx={{ mt: 1, textDecoration: task.isDeleted ? "line-through" : "none" }}
          >
            {dateRange}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          {!task.isDeleted && (
            <Chip
              label={active ? "Активна" : "Неактивна"}
              color={active ? "success" : "default"}
              size="small"
              sx={{ borderRadius: 1 }}
            />
          )}
          <IconButton size="small" onClick={() => setExpanded((e) => !e)} aria-label={expanded ? "Свернуть" : "Развернуть"}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(task)} aria-label="Редактировать">
            <EditIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Заявки по задаче
          </Typography>
          <TaskSubmissionsList taskId={task.id} page={1} size={5} status="pending" />
        </Box>
      </Collapse>
    </Paper>
  );
}
