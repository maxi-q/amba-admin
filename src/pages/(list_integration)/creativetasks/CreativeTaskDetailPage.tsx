import { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Paper, Chip, Link, IconButton, Stack } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import { TaskDetailSubmissionsList } from "./components/TaskDetailSubmissionsList";
import { CreativeTaskWhitelistSection } from "./components/CreativeTaskWhitelistSection";
import { EditCreativeTaskDialog } from "./components/EditCreativeTaskDialog";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { formatDateRange, isTaskActive } from "./utils/creativetaskUtils";
import { PRIMARY_COLOR } from "@/constants/colors";

export default function CreativeTaskDetailPage() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { task, isLoading, isError, error, refetch } = useCreativeTask(taskId ?? "");
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <SettingsLoadingState />
      </Box>
    );
  }

  if (isError || !task) {
    return (
      <CreativeTasksErrorState
        errorMessage={(error as Error)?.message ?? "Задача не найдена"}
      />
    );
  }

  const dateRange = formatDateRange(task.startsAt, task.endsAt);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt);

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Link
        component={RouterLink}
        to={`/rooms/${slug ?? ""}/creativetasks`}
        underline="hover"
        sx={{ display: "inline-block", mb: 2, color: "text.secondary", fontSize: "0.875rem" }}
      >
        ← К списку креативных задач
      </Link>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          opacity: task.isDeleted ? 0.7 : 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{
                textDecoration: task.isDeleted ? "line-through" : "none",
                color: task.isDeleted ? "text.disabled" : "inherit",
              }}
            >
              {task.title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
                whiteSpace: "pre-wrap",
                textDecoration: task.isDeleted ? "line-through" : "none",
              }}
            >
              {task.description || "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
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
            <IconButton
              size="small"
              onClick={() => setEditOpen(true)}
              aria-label="Редактировать задачу"
            >
              <EditIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      <EditCreativeTaskDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        onSuccess={() => {
          void refetch();
        }}
      />

      <TaskDetailSubmissionsList taskId={task.id} />

      <CreativeTaskWhitelistSection task={task} />
    </Box>
  );
}
