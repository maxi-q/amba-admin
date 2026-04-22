import { useState } from "react";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { useUpdateSubmissionStatus } from "@/hooks/creativetasks/useUpdateSubmissionStatus";
import { SubmissionApproveDialog } from "./SubmissionApproveDialog";
import { SubmissionRejectDialog } from "./SubmissionRejectDialog";
import { CreativesPaginationControls } from "./CreativesPaginationControls";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";
import { Badge, Button, Card, CardContent, PageLoader } from "@senler/ui";

const statusLabels: Record<ISubmission["status"], string> = {
  pending: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const statusVariant: Record<
  ISubmission["status"],
  "success" | "destructive" | "secondary"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
};

const tabInactive =
  "relative border-0 border-b-2 border-transparent bg-transparent pb-2 pt-0.5 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative border-0 border-b-2 border-primary bg-transparent pb-2 pt-0.5 text-[15px] font-semibold text-foreground";

type StatusTab = ISubmission["status"];

const TABS: { value: StatusTab; label: string }[] = [
  { value: "pending", label: "На рассмотрении" },
  { value: "approved", label: "Одобрено" },
  { value: "rejected", label: "Отклонено" },
];

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
    status: statusTab,
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
    <div>
      <h2 className="mb-2 text-lg font-semibold">Ответы на задачу</h2>

      <div className="mb-2 border-b border-border">
        <div className="flex flex-wrap gap-2 sm:gap-4" role="tablist" aria-label="Статус заявок">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              className={statusTab === t.value ? tabActive : tabInactive}
              aria-selected={statusTab === t.value}
              onClick={() => {
                setStatusTab(t.value);
                setPage(1);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <PageLoader label="Загрузка…" />
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Заявок нет</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {submissions.map((sub) => (
              <Card key={sub.id} className="border border-border shadow-none">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {sub.content || "—"}
                      </p>
                      {sub.comment ? (
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          Комментарий: {sub.comment}
                        </p>
                      ) : null}
                      {sub.reviewComment ? (
                        <p className="mt-1 block text-xs text-muted-foreground">
                          Ответ модератора: {sub.reviewComment}
                        </p>
                      ) : null}
                      {sub.status === "approved" && sub.rewardValue != null ? (
                        <p className="mt-1 block text-xs text-green-700 dark:text-green-400">
                          Награда: {sub.rewardValue}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant={statusVariant[sub.status]}>
                      {statusLabels[sub.status]}
                    </Badge>
                  </div>
                  {sub.status === "pending" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="default"
                        onClick={() => setApproveSubmission(sub)}
                        disabled={isPending}
                      >
                        Одобрить
                      </Button>
                      <Button
                        type="button"
                        size="default"
                        variant="destructive"
                        onClick={() => setRejectSubmission(sub)}
                        disabled={isPending}
                      >
                        Отклонить
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <CreativesPaginationControls
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              className="mt-4"
            />
          ) : null}
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
    </div>
  );
}
