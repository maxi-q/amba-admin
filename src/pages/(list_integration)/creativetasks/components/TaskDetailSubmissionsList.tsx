import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { User } from "lucide-react";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { useSubmission } from "@/hooks/creativetasks/useSubmission";
import { useUpdateSubmissionStatus } from "@/hooks/creativetasks/useUpdateSubmissionStatus";
import { SubmissionStatusLogDialog } from "./SubmissionStatusLogDialog";
import { CreativesPaginationControls } from "./CreativesPaginationControls";
import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";
import { Alert, AlertDescription, Avatar, Button, PageLoader } from "@senler/ui";
import { isFinalApproveStatus } from "../submissionStatus";

interface TaskDetailSubmissionsListProps {
  taskId: string;
  minimalRewardInBalls: number;
  isFrozen?: boolean;
  reviewUnavailable?: string;
}

const SUBMISSION_PROGRESS: Record<
  BaseCreativeTaskSubmissionDto["status"],
  { progress: number; label: string; needsReview?: boolean }
> = {
  new: { progress: 0, label: "Черновик" },
  waiting_for_review_materials: {
    progress: 1,
    label: "Проверьте работу",
    needsReview: true,
  },
  rejected_for_materials: { progress: 1, label: "Материалы отклонены" },
  waiting_for_publication: { progress: 2, label: "Публикация..." },
  waiting_for_review_publication: {
    progress: 2,
    label: "Проверьте публикацию",
    needsReview: true,
  },
  rejected_for_publication: { progress: 2, label: "Публикация отклонена" },
  approved: { progress: 3, label: "Задание принято" },
};

export function SubmissionProgress({ submission }: { submission: BaseCreativeTaskSubmissionDto }) {
  const meta = SUBMISSION_PROGRESS[submission.status];
  const label =
    submission.status === "approved" && submission.rewardValue != null
      ? `Начислено ${submission.rewardValue.toLocaleString("ru-RU")} XP`
      : meta.label;

  return (
    <div className="flex w-[149px] shrink-0 flex-col gap-1">
      <div className="flex w-full gap-0.5" aria-hidden>
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={`h-1 min-w-0 flex-1 rounded-full ${
              step <= meta.progress ? "bg-[#26c464]" : "bg-[#e4e4e4]"
            }`}
          />
        ))}
      </div>
      <span
        className={`flex min-w-0 items-center gap-1 truncate text-xs font-medium leading-4 ${
          meta.needsReview ? "text-black" : "text-[#797979]"
        }`}
      >
        {meta.needsReview ? (
          <span className="size-1 shrink-0 rounded-full bg-[#26c464]" aria-hidden />
        ) : null}
        <span className="truncate">{label}</span>
      </span>
    </div>
  );
}

export function TaskDetailSubmissionsList({
  taskId,
  minimalRewardInBalls,
  isFrozen = false,
  reviewUnavailable,
}: TaskDetailSubmissionsListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [logSubmission, setLogSubmission] = useState<BaseCreativeTaskSubmissionDto | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSubmissionId = searchParams.get("submission") ?? "";
  const requestedSubmission = useSubmission(requestedSubmissionId);
  const activeSubmission = logSubmission ?? (requestedSubmission.submission?.taskId === taskId ? requestedSubmission.submission : null);
  const closeLog = () => {
    setLogSubmission(null);
    if (requestedSubmissionId) setSearchParams((params) => { params.delete("submission"); return params; }, { replace: true });
  };
  const search = searchParams.get("search")?.trim().toLocaleLowerCase("ru-RU") ?? "";

  useEffect(() => setPage(1), [search]);

  const { submissions, isLoading, pagination, isError, refetch } = useSubmissions(taskId, {
    page: search ? 1 : page,
    size: search ? 100 : pageSize,
  }, { allPages: !!search });

  const ambassadorIds = useMemo(
    () => Array.from(new Set(submissions.map((submission) => submission.ambassadorId))),
    [submissions],
  );
  const { ambassadors, isLoading: isLoadingAmbassadors, isError: isAmbassadorError, refetch: refetchAmbassadors } = useAmbassadors({
    page: 1,
    size: Math.max(ambassadorIds.length, 1),
    ambassadorIds,
  }, { allPages: true, enabled: ambassadorIds.length > 0 });
  const ambassadorsById = useMemo(
    () => new Map(ambassadors.map((ambassador) => [ambassador.id, ambassador])),
    [ambassadors],
  );
  const matchingSubmissions = useMemo(
    () =>
      search
        ? submissions.filter((submission) => {
            const ambassador = ambassadorsById.get(submission.ambassadorId);
            return `${ambassador?.username ?? ""} ${submission.ambassadorId}`
              .toLocaleLowerCase("ru-RU")
              .includes(search);
          })
        : submissions,
    [ambassadorsById, search, submissions],
  );
  const totalPages = search ? Math.ceil(matchingSubmissions.length / pageSize) : pagination?.totalPages ?? 0;
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const visibleSubmissions = search ? matchingSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize) : matchingSubmissions;

  const { updateSubmissionStatus, isPending, reset, error: reviewError } = useUpdateSubmissionStatus();

  const handleLogApprove = (
    submission: BaseCreativeTaskSubmissionDto,
    rewardValue?: number,
  ) => {
    if (isFrozen || reviewUnavailable || isPending) return;
    updateSubmissionStatus({
      id: submission.id,
      data: {
        decision: "approve",
        reviewComment: "",
        ...(isFinalApproveStatus(submission.status) ? { rewardValue } : {}),
      },
    }, { onSuccess: closeLog });
  };

  const handleLogReject = (
    submission: BaseCreativeTaskSubmissionDto,
    reviewComment: string,
  ) => {
    if (isFrozen || reviewUnavailable || isPending) return;
    updateSubmissionStatus({
      id: submission.id,
      data: { decision: "reject", reviewComment },
    }, { onSuccess: closeLog });
  };

  return (
    <div>
      {requestedSubmissionId && (requestedSubmission.isError || (requestedSubmission.submission && requestedSubmission.submission.taskId !== taskId)) && <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Запрошенное выполнение недоступно в этом задании.<Button variant="outline" onClick={closeLog}>Закрыть</Button></AlertDescription></Alert>}
      {isFrozen || reviewUnavailable ? (
        <Alert className="mx-4 mb-3">
          <AlertDescription>
            {reviewUnavailable || 'Задание остановлено. Выполнения доступны для просмотра, но модерация приостановлена.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {isError || (search && isAmbassadorError) ? (
        <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Не удалось загрузить выполнения или имена участников. Поиск может быть неполным.<Button variant="outline" className="ml-2" onClick={() => { void refetch(); if (ambassadorIds.length > 0) void refetchAmbassadors(); }}>Повторить</Button></AlertDescription></Alert>
      ) : isLoading || (search && isLoadingAmbassadors) ? (
        <div className="flex justify-center py-8">
          <PageLoader label="Загрузка…" />
        </div>
      ) : submissions.length === 0 ? (
        <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
          Выполнений нет
        </p>
      ) : visibleSubmissions.length === 0 ? (
        <p className="px-4 py-6 text-[13px] font-medium text-[#797979]">
          Ничего не найдено
        </p>
      ) : (
        <>
          <div className="overflow-hidden">
            {visibleSubmissions.map((submission) => {
              const ambassador = ambassadorsById.get(submission.ambassadorId);
              const ambassadorName =
                ambassador?.username ?? submission.ambassadorId;

              return (
                <button
                  key={submission.id}
                  type="button"
                  className="flex h-12 w-full items-center gap-4 border-b border-[#e4e4e4] px-4 text-left hover:bg-[#fafafa]"
                  onClick={() => { reset(); setLogSubmission(submission); }}
                  aria-label={`Открыть статус задания: ${ambassadorName}`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <Avatar
                      src={ambassador?.avatarUrl}
                      size="sm"
                      shape="rounded"
                      name={ambassadorName}
                      colorKey={submission.ambassadorId}
                      fallbackClassName="border border-[#e4e4e4] bg-[#f0f0f0] text-[#797979]"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 text-black">
                      {ambassadorName}
                    </span>
                  </span>
                  <SubmissionProgress submission={submission} />
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] border border-[#e4e4e4] text-[#797979]">
                    <User className="size-4" aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="px-4">
              <CreativesPaginationControls
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                className="mt-4"
              />
            </div>
          ) : null}
        </>
      )}

      <SubmissionStatusLogDialog
        open={!!activeSubmission}
        submission={activeSubmission}
        minimalRewardInBalls={minimalRewardInBalls}
        onClose={() => { if (!isPending) closeLog(); }}
        onApprove={handleLogApprove}
        onReject={handleLogReject}
        isPending={isPending}
        reviewDisabled={isFrozen || !!reviewUnavailable}
        reviewDisabledReason={reviewUnavailable}
        errorMessage={reviewError ? reviewError.message || "Не удалось сохранить решение. Попробуйте ещё раз." : undefined}
      />
    </div>
  );
}
