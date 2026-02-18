import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Pagination,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { useUpdateSubmissionStatus } from "@/hooks/creativetasks/useUpdateSubmissionStatus";
import { SubmissionApproveDialog } from "./SubmissionApproveDialog";
import { SubmissionRejectDialog } from "./SubmissionRejectDialog";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";
import { PRIMARY_COLOR } from "@/constants/colors";
import { Loader } from "@/components/Loader";

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

type StatusTab = ISubmission["status"];

interface TaskDetailSubmissionsListProps {
  taskId: string;
}

export function TaskDetailSubmissionsList({ taskId }: TaskDetailSubmissionsListProps) {
  const [statusTab, setStatusTab] = useState<StatusTab>("pending");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [approveSubmission, setApproveSubmission] = useState<ISubmission | null>(null);
  const [rejectSubmission, setRejectSubmission] = useState<ISubmission | null>(null);

  const { submissions, isLoading, pagination } = useSubmissions(taskId, {
    page,
    size: pageSize,
    status: statusTab
  });

  const { updateSubmissionStatus, isPending } = useUpdateSubmissionStatus();

  const handleApproveConfirm = ({ rewardValue }: { rewardValue: number }) => {
    if (!approveSubmission) return;
    updateSubmissionStatus({
      id: approveSubmission.id,
      data: { status: "approved", reviewComment: "", rewardValue },
    });
    setApproveSubmission(null);
  };

  const handleRejectConfirm = ({ reviewComment }: { reviewComment: string }) => {
    if (!rejectSubmission) return;
    updateSubmissionStatus({
      id: rejectSubmission.id,
      data: { status: "rejected", reviewComment, rewardValue: 0 },
    });
    setRejectSubmission(null);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Ответы на задачу
      </Typography>

      <Tabs
        value={statusTab}
        onChange={(_, v: StatusTab) => { setStatusTab(v); setPage(1); }}
        sx={{
          "& .MuiTab-root": { textTransform: "none" },
          "& .Mui-selected": { color: PRIMARY_COLOR, fontWeight: 500 },
          "& .MuiTabs-indicator": { backgroundColor: PRIMARY_COLOR },
          mb: 2,
        }}
      >
        <Tab label="На рассмотрении" value="pending" />
        <Tab label="Одобрено" value="approved" />
        <Tab label="Отклонено" value="rejected" />
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Loader />
        </Box>
      ) : submissions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Заявок нет
        </Typography>
      ) : (
        <>
          <Stack spacing={2}>
            {submissions.map((sub) => (
              <Paper
                key={sub.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {sub.content || "—"}
                    </Typography>
                    {sub.comment && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Комментарий: {sub.comment}
                      </Typography>
                    )}
                    {sub.reviewComment && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Ответ модератора: {sub.reviewComment}
                      </Typography>
                    )}
                    {sub.status === "approved" && sub.rewardValue != null && (
                      <Typography variant="caption" color="success.main" display="block">
                        Награда: {sub.rewardValue}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={statusLabels[sub.status]}
                    color={statusColors[sub.status]}
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                {sub.status === "pending" && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setApproveSubmission(sub)}
                      disabled={isPending}
                      sx={{
                        backgroundColor: PRIMARY_COLOR,
                        "&:hover": { backgroundColor: PRIMARY_COLOR, opacity: 0.9 },
                      }}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => setRejectSubmission(sub)}
                      disabled={isPending}
                    >
                      Отклонить
                    </Button>
                  </Stack>
                )}
              </Paper>
            ))}
          </Stack>

          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root.Mui-selected": { backgroundColor: PRIMARY_COLOR },
                }}
              />
            </Box>
          )}
        </>
      )}

      <SubmissionApproveDialog
        open={!!approveSubmission}
        submission={approveSubmission}
        onClose={() => setApproveSubmission(null)}
        onConfirm={handleApproveConfirm}
        isPending={isPending}
      />
      <SubmissionRejectDialog
        open={!!rejectSubmission}
        submission={rejectSubmission}
        onClose={() => setRejectSubmission(null)}
        onConfirm={handleRejectConfirm}
        isPending={isPending}
      />
    </Box>
  );
}
