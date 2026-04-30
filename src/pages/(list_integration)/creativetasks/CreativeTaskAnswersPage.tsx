import { useOutletContext } from "react-router-dom";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import { TaskDetailSubmissionsList } from "./components/TaskDetailSubmissionsList";

interface OutletCtx {
  task: ICreativeTask;
}

/**
 * Подпункт «Ответы на задачу»: список заявок и фильтры по статусу.
 */
export default function CreativeTaskAnswersPage() {
  const { task } = useOutletContext<OutletCtx>();

  return <TaskDetailSubmissionsList taskId={task.id} />;
}
