import { useOutletContext } from "react-router-dom";
import type { BaseCreativeTaskDto } from "@/api/generated/model";
import { TaskDetailSubmissionsList } from "./components/TaskDetailSubmissionsList";

interface OutletCtx {
  task: BaseCreativeTaskDto;
}

/**
 * Подпункт «Ответы на задачу»: список заявок и фильтры по статусу.
 */
export default function CreativeTaskAnswersPage() {
  const { task } = useOutletContext<OutletCtx>();

  return <TaskDetailSubmissionsList taskId={task.id} />;
}
