import { Link } from "react-router-dom";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@senler/ui";
import type { BaseCreativeTaskSubmissionDtoStatus } from "@/api/generated/model";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { answersLabel, getSubmissionCounts, isReviewableSubmissionStatus, SUBMISSION_STATUS_LABELS } from "../submissionStatus";
import chevron from "@/assets/task-flow/chevron.svg";
import users from "@/assets/task-flow/users.svg";

export function TaskSubmissionBadges({ taskId, roomSlug, showCompleted = false }: {
  taskId: string; roomSlug: string; showCompleted?: boolean;
}) {
  const { submissions, isLoading, isError, refetch } = useSubmissions(taskId, { page: 1, size: 100 }, { allPages: true });
  if (isLoading) return <span className="text-xs text-[#797979]" aria-label="Загрузка выполнений">…</span>;
  if (isError) return <Button variant="outline" size="sm" onClick={() => void refetch()}>Повторить загрузку</Button>;
  const counts = getSubmissionCounts(submissions);
  const answersPath = `/rooms/${roomSlug}/creativetasks/${taskId}/answers`;
  const badgeClass = "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-[28px] px-1.5 text-[13px] font-medium leading-4 tracking-[-0.0325px]";
  return <>
    {counts.review > 0 && <Link to={answersPath} title="Ожидают проверки" className={`${badgeClass} bg-[rgba(213,32,148,0.15)] text-[#d52094]`}>{answersLabel(counts.review)}</Link>}
    {showCompleted ? (
      <Link to={answersPath} className={`${badgeClass} border border-border`} title={`Одобрено: ${counts.approved}. Всего начатых выполнений: ${counts.total}.`}>
        <img src={users} alt="" />{counts.approved} выполнено
      </Link>
    ) : counts.inWork > 0 ? (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`${badgeClass} gap-1 border-[#e4e4e4] bg-card shadow-none`} aria-label={`В работе: ${counts.inWork}. Показать статусы`}>
            <span className="flex size-4 items-center justify-center"><span className="size-2 rounded-full border border-[#f97316]" /></span>
            {counts.inWork} в работе<img src={chevron} alt="" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[260px] space-y-2 p-3 text-[13px] leading-4">
          <p className="font-medium">В работе</p>
          {(Object.entries(counts.byStatus) as [BaseCreativeTaskSubmissionDtoStatus, number][])
            .filter(([status]) => status !== "approved" && !isReviewableSubmissionStatus(status))
            .map(([status, count]) => <p key={status} className="flex justify-between gap-3"><span className="text-[#797979]">{SUBMISSION_STATUS_LABELS[status]}</span><span>{count}</span></p>)}
          <p className="text-xs text-[#797979]">Только начатые выполнения. Ответы на проверке учитываются отдельно.</p>
        </PopoverContent>
      </Popover>
    ) : counts.approved > 0 && counts.review === 0 ? <span className={`${badgeClass} bg-muted text-[#797979]`}>Все проверено</span> : null}
  </>;
}
