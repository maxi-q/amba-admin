import { Box, Typography, Chip } from "@mui/material";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";

const statusLabels: Record<ISubmission["status"], string> = {
  pending: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено"
};

const statusColors: Record<ISubmission["status"], "default" | "success" | "error"> = {
  pending: "default",
  approved: "success",
  rejected: "error"
};

interface TaskSubmissionsListProps {
  taskId: string;
  page?: number;
  size?: number;
  status?: ISubmission["status"];
}

/**
 * Список сабмишенов по задаче (использует useSubmissions)
 */
export function TaskSubmissionsList({
  taskId,
  page = 1,
  size = 10,
  status = "pending"
}: TaskSubmissionsListProps) {
  const { submissions, isLoading, pagination } = useSubmissions(taskId, { page, size, status });

  if (isLoading) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Загрузка заявок…
        </Typography>
      </Box>
    );
  }

  if (submissions.length === 0) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Заявок пока нет
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Заявок: {pagination?.total ?? 0}
      </Typography>
      {submissions.map((sub) => (
        <Box
          key={sub.id}
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
              {sub.content || "—"}
            </Typography>
            <Chip
              label={statusLabels[sub.status]}
              color={statusColors[sub.status]}
              size="small"
              sx={{ borderRadius: 1 }}
            />
          </Box>
          {sub.reviewComment && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {sub.reviewComment}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
