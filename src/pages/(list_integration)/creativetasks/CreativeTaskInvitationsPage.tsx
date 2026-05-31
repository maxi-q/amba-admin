import { useOutletContext } from "react-router-dom";
import type { BaseCreativeTaskDto } from "@/api/generated/model";
import { CreativeTaskWhitelistSection } from "./components/CreativeTaskWhitelistSection";

interface OutletCtx {
  task: BaseCreativeTaskDto;
}

/**
 * Подпункт «Приглашения в задачу»: управление вайтлистом задачи.
 */
export default function CreativeTaskInvitationsPage() {
  const { task } = useOutletContext<OutletCtx>();

  return <CreativeTaskWhitelistSection task={task} />;
}
