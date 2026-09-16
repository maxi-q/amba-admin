import { useOutletContext } from "react-router-dom";
import type { BaseCreativeTaskDto } from "@/api/generated/model";
import { TaskDetailSubmissionsList } from "./components/TaskDetailSubmissionsList";

interface OutletCtx {
  task: BaseCreativeTaskDto;
}

/**
 * Подпункт «Выполнение»: список выполнений задания.
 */
export default function CreativeTaskAnswersPage() {
  const { task } = useOutletContext<OutletCtx>();

  return (
    <TaskDetailSubmissionsList
      taskId={task.id}
      minimalRewardInBalls={task.minimalRewardInBalls}
      isFrozen={task.isFrozen}
    />
  );
}
