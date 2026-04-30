import { useOutletContext } from "react-router-dom";
import type { ICreativeTask } from "@services/creativetasks/creativetasks.types";
import { CreativeTaskWhitelistSection } from "./components/CreativeTaskWhitelistSection";

interface OutletCtx {
  task: ICreativeTask;
}

/**
 * Подпункт «Приглашения в задачу»: управление вайтлистом задачи.
 */
export default function CreativeTaskInvitationsPage() {
  const { task } = useOutletContext<OutletCtx>();

  return <CreativeTaskWhitelistSection task={task} />;
}
