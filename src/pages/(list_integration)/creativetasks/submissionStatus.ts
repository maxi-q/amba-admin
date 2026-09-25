import type { BaseCreativeTaskSubmissionDto, BaseCreativeTaskSubmissionDtoStatus } from "@/api/generated/model";

export const SUBMISSION_STATUS_LABELS: Record<BaseCreativeTaskSubmissionDtoStatus, string> = {
  new: "Черновик",
  waiting_for_review_materials: "На проверке материалов",
  rejected_for_materials: "Отклонено (материалы)",
  waiting_for_publication: "Ожидает публикации",
  waiting_for_review_publication: "На проверке публикации",
  rejected_for_publication: "Отклонено (публикация)",
  approved: "Одобрено",
};

export const SUBMISSION_STATUS_VARIANT: Record<
  BaseCreativeTaskSubmissionDtoStatus,
  "success" | "destructive" | "secondary"
> = {
  new: "secondary",
  waiting_for_review_materials: "secondary",
  rejected_for_materials: "destructive",
  waiting_for_publication: "secondary",
  waiting_for_review_publication: "secondary",
  rejected_for_publication: "destructive",
  approved: "success",
};

export const SUBMISSION_REVIEW_TABS: {
  value: BaseCreativeTaskSubmissionDtoStatus;
  label: string;
}[] = [
  { value: "waiting_for_review_materials", label: "Материалы" },
  { value: "waiting_for_review_publication", label: "Публикации" },
  { value: "approved", label: "Одобрено" },
  { value: "rejected_for_materials", label: "Отклонено (материалы)" },
  { value: "rejected_for_publication", label: "Отклонено (публикация)" },
];

export function isReviewableSubmissionStatus(status: BaseCreativeTaskSubmissionDtoStatus): boolean {
  return (
    status === "waiting_for_review_materials" || status === "waiting_for_review_publication"
  );
}

export function isFinalApproveStatus(status: BaseCreativeTaskSubmissionDtoStatus): boolean {
  return status === "waiting_for_review_publication";
}

/** Review and work are disjoint: an unsent draft is not an answer awaiting review. */
export function getSubmissionCounts(submissions: Pick<BaseCreativeTaskSubmissionDto, "status">[]) {
  const byStatus: Partial<Record<BaseCreativeTaskSubmissionDtoStatus, number>> = {};
  for (const { status } of submissions) byStatus[status] = (byStatus[status] ?? 0) + 1;
  const review = (byStatus.waiting_for_review_materials ?? 0) + (byStatus.waiting_for_review_publication ?? 0);
  const approved = byStatus.approved ?? 0;
  return { byStatus, review, approved, inWork: submissions.length - review - approved, total: submissions.length };
}

export function answersLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  return `${count} ${mod10 === 1 && mod100 !== 11 ? "ответ" : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? "ответа" : "ответов"}`;
}
