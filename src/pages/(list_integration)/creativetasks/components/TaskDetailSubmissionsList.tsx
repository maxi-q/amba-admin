import { useState } from "react";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { useUpdateSubmissionStatus } from "@/hooks/creativetasks/useUpdateSubmissionStatus";
import { SubmissionApproveDialog } from "./SubmissionApproveDialog";
import { SubmissionRejectDialog } from "./SubmissionRejectDialog";
import { CreativesPaginationControls } from "./CreativesPaginationControls";
import { SubmissionContentPreview } from "./SubmissionContentPreview";
import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";
import { Badge, Button, Card, CardContent, PageLoader } from "@senler/ui";
import {
  SUBMISSION_REVIEW_TABS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_VARIANT,
  isFinalApproveStatus,
  isReviewableSubmissionStatus,
} from "../submissionStatus";

type StatusTab = BaseCreativeTaskSubmissionDto["status"];

interface TaskDetailSubmissionsListProps {
  taskId: string;
}

export function TaskDetailSubmissionsList({ taskId }: TaskDetailSubmissionsListProps) {
  const [statusTab, setStatusTab] = useState<StatusTab>("waiting_for_review_materials");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [approveSubmission, setApproveSubmission] = useState<BaseCreativeTaskSubmissionDto | null>(null);
  const [rejectSubmission, setRejectSubmission] = useState<BaseCreativeTaskSubmissionDto | null>(null);

  const { submissions, isLoading, pagination } = useSubmissions(taskId, {
    page,
    size: pageSize,
    status: statusTab,
  });

  const { updateSubmissionStatus, isPending } = useUpdateSubmissionStatus();

  const handleApproveClick = (sub: BaseCreativeTaskSubmissionDto) => {
    if (isFinalApproveStatus(sub.status)) {
      setApproveSubmission(sub);
      return;
    }
    updateSubmissionStatus({
      id: sub.id,
      data: { decision: "approve", reviewComment: "" },
    });
  };

  const handleApproveConfirm = ({ rewardValue }: { rewardValue: number }) => {
    if (!approveSubmission) return;
    updateSubmissionStatus({
      id: approveSubmission.id,
      data: { decision: "approve", reviewComment: "", rewardValue },
    });
    setApproveSubmission(null);
  };

  const handleRejectConfirm = ({ reviewComment }: { reviewComment: string }) => {
    if (!rejectSubmission) return;
    updateSubmissionStatus({
      id: rejectSubmission.id,
      data: { decision: "reject", reviewComment },
    });
    setRejectSubmission(null);
  };

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Ответы на задачу</h2>

      <div className="mb-2 border-b border-border">
        <div className="flex flex-wrap gap-2 sm:gap-4" role="tablist" aria-label="Статус заявок">
          {SUBMISSION_REVIEW_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              className={
                statusTab === t.value
                  ? "relative border-0 border-b-2 border-primary bg-transparent pb-2 pt-0.5 text-[15px] font-semibold text-foreground"
                  : "relative border-0 border-b-2 border-transparent bg-transparent pb-2 pt-0.5 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground"
              }
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
                      <SubmissionContentPreview submission={sub} />
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
                    <Badge variant={SUBMISSION_STATUS_VARIANT[sub.status]}>
                      {SUBMISSION_STATUS_LABELS[sub.status]}
                    </Badge>
                  </div>
                  {isReviewableSubmissionStatus(sub.status) ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="default"
                        onClick={() => handleApproveClick(sub)}
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
