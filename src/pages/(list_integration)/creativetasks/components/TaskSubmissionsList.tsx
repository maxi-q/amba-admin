import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";
import { Badge, Card, CardContent } from "@senler/ui";
import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";

const statusLabels: Record<BaseCreativeTaskSubmissionDto["status"], string> = {
  new: "Черновик",
  waiting_for_review: "На рассмотрении",
  approved: "Одобрено",
  rejected_for_format: "Отклонено",
};

const statusVariant: Record<
  BaseCreativeTaskSubmissionDto["status"],
  "success" | "destructive" | "secondary"
> = {
  new: "secondary",
  waiting_for_review: "secondary",
  approved: "success",
  rejected_for_format: "destructive",
};

interface TaskSubmissionsListProps {
  taskId: string;
  page?: number;
  size?: number;
  status?: BaseCreativeTaskSubmissionDto["status"];
}

/**
 * Список сабмишенов по задаче (использует useSubmissions)
 */
export function TaskSubmissionsList({
  taskId,
  page = 1,
  size = 10,
  status = "waiting_for_review",
}: TaskSubmissionsListProps) {
  const { submissions, isLoading, pagination } = useSubmissions(taskId, {
    page,
    size,
    status,
  });

  if (isLoading) {
    return (
      <p className="py-2 text-sm text-muted-foreground">Загрузка заявок…</p>
    );
  }

  if (submissions.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">Заявок пока нет</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-1">
      <p className="text-xs text-muted-foreground">
        Заявок: {pagination?.total ?? 0}
      </p>
      {submissions.map((sub) => (
        <Card
          key={sub.id}
          className="border border-border/80 bg-muted/30 shadow-none"
        >
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                {sub.content || "—"}
              </p>
              <Badge variant={statusVariant[sub.status]}>
                {statusLabels[sub.status]}
              </Badge>
            </div>
            {sub.reviewComment ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {sub.reviewComment}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
