import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageLoader,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import type {
  GetPrivateSubmissionsResponseItemDto,
  PrivateCreativeTaskWithDefaultsDto,
} from "@/api/generated/model";
import { usePrivateSubmissions } from "@/hooks/creativetasks/usePrivateSubmissions";
import { useUpdatePrivateSubmissionStatus } from "@/hooks/creativetasks/useUpdatePrivateSubmissionStatus";
import { CreativesPaginationControls } from "./components/CreativesPaginationControls";
import { SubmissionContentPreview } from "./components/SubmissionContentPreview";

type PrivateSubmissionStatus = GetPrivateSubmissionsResponseItemDto["status"];

const statusLabels: Record<PrivateSubmissionStatus, string> = {
  new: "Черновик",
  waiting_for_review: "На рассмотрении",
  approved: "Одобрено",
  rejected_for_format: "Отклонено",
};

const statusVariant: Record<PrivateSubmissionStatus, "success" | "destructive" | "secondary"> = {
  new: "secondary",
  waiting_for_review: "secondary",
  approved: "success",
  rejected_for_format: "destructive",
};

const tabInactive =
  "relative border-0 border-b-2 border-transparent bg-transparent pb-2 pt-0.5 text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative border-0 border-b-2 border-primary bg-transparent pb-2 pt-0.5 text-[15px] font-semibold text-foreground";

const TABS: { value: PrivateSubmissionStatus; label: string }[] = [
  { value: "waiting_for_review", label: "На рассмотрении" },
  { value: "approved", label: "Одобрено" },
  { value: "rejected_for_format", label: "Отклонено" },
];

const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface OutletCtx {
  task: PrivateCreativeTaskWithDefaultsDto;
}

function RejectPrivateSubmissionDialog({
  open,
  submission,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean;
  submission: GetPrivateSubmissionsResponseItemDto | null;
  onClose: () => void;
  onConfirm: (params: { reviewComment: string }) => void;
  isPending: boolean;
}) {
  const [reviewComment, setReviewComment] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const trimmed = reviewComment.trim();
    if (!trimmed) {
      setError("Комментарий обязателен при отклонении");
      return;
    }
    setError("");
    onConfirm({ reviewComment: trimmed });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex !max-h-[min(100dvh,32rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            Отклонить ответ
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 py-4">
          {submission ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Комментарий (reviewComment) *</p>
              <textarea
                className={TEXTAREA_CLASS}
                value={reviewComment}
                onChange={(e) => {
                  setReviewComment(e.target.value);
                  if (error) setError("");
                }}
                rows={3}
                aria-label="Комментарий"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={handleConfirm}
            disabled={isPending || !reviewComment.trim()}
          >
            {isPending ? "Сохранение…" : "Отклонить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function PrivateCreativeTaskAnswersPage() {
  const { task } = useOutletContext<OutletCtx>();
  const [statusTab, setStatusTab] = useState<PrivateSubmissionStatus>("waiting_for_review");
  const [page, setPage] = useState(1);
  const [rejectSubmission, setRejectSubmission] = useState<GetPrivateSubmissionsResponseItemDto | null>(null);
  const pageSize = 10;

  const { submissions, isLoading, pagination } = usePrivateSubmissions(task.id, {
    page,
    size: pageSize,
    status: statusTab,
  });
  const { updatePrivateSubmissionStatus, isPending } = useUpdatePrivateSubmissionStatus();

  const approveSubmission = (submission: GetPrivateSubmissionsResponseItemDto) => {
    updatePrivateSubmissionStatus({
      id: submission.id,
      data: { status: "approved", reviewComment: "" },
    });
  };

  const handleRejectConfirm = ({ reviewComment }: { reviewComment: string }) => {
    if (!rejectSubmission) return;
    updatePrivateSubmissionStatus({
      id: rejectSubmission.id,
      data: { status: "rejected_for_format", reviewComment },
    });
    setRejectSubmission(null);
  };

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Ответы на индивидуальную задачу</h2>

      <div className="mb-2 border-b border-border">
        <div className="flex flex-wrap gap-2 sm:gap-4" role="tablist" aria-label="Статус ответов">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              className={statusTab === tab.value ? tabActive : tabInactive}
              aria-selected={statusTab === tab.value}
              onClick={() => {
                setStatusTab(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <PageLoader label="Загрузка…" />
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ответов нет</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => (
              <Card key={submission.id} className="border border-border shadow-none">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <SubmissionContentPreview submission={submission} />
                      {submission.comment ? (
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          Комментарий: {submission.comment}
                        </p>
                      ) : null}
                      {submission.reviewComment ? (
                        <p className="mt-1 block text-xs text-muted-foreground">
                          Ответ модератора: {submission.reviewComment}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Амбассадор: {submission.ambassadorId}
                      </p>
                    </div>
                    <Badge variant={statusVariant[submission.status]}>
                      {statusLabels[submission.status]}
                    </Badge>
                  </div>
                  {submission.status === "waiting_for_review" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="default"
                        onClick={() => approveSubmission(submission)}
                        disabled={isPending}
                      >
                        Одобрить
                      </Button>
                      <Button
                        type="button"
                        size="default"
                        variant="destructive"
                        onClick={() => setRejectSubmission(submission)}
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

      <RejectPrivateSubmissionDialog
        open={!!rejectSubmission}
        submission={rejectSubmission}
        onClose={() => setRejectSubmission(null)}
        onConfirm={handleRejectConfirm}
        isPending={isPending}
      />
    </div>
  );
}
