import { useOutletContext } from "react-router-dom";
import type { BaseCreativeTaskDto } from "@/api/generated/model";
import { TaskDetailSubmissionsList } from "./components/TaskDetailSubmissionsList";
import { useCompetitionReview } from "@/hooks/competitions/useCompetitionQueries";
import { Alert, AlertDescription, Button } from "@senler/ui";

interface OutletCtx {
  task: BaseCreativeTaskDto;
}

/**
 * Подпункт «Выполнение»: список выполнений задания.
 */
export default function CreativeTaskAnswersPage() {
  const { task } = useOutletContext<OutletCtx>();
  const review = useCompetitionReview({ kind: 'sprint', id: task.sprintId, roomId: task.roomId });
  const closed = review.data?.resultsFixedAt || review.data?.status === 'awarding' || review.data?.status === 'completed';

  return (
    <>
    {review.isError && <Alert variant="destructive"><AlertDescription>Не удалось проверить доступность модерации.<Button variant="outline" onClick={() => void review.refetch()}>Повторить</Button></AlertDescription></Alert>}
    <TaskDetailSubmissionsList
      taskId={task.id}
      minimalRewardInBalls={task.minimalRewardInBalls}
      isFrozen={task.isFrozen}
      reviewUnavailable={closed ? 'Итоги спринта зафиксированы. Выполнения доступны только для просмотра.' : !review.data ? 'Проверяем доступность модерации…' : undefined}
    />
    </>
  );
}
