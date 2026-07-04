import { useOutletContext } from "react-router-dom";
import type { PrivateCreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { CreativeTaskWhitelistSection } from "./components/CreativeTaskWhitelistSection";

interface OutletCtx {
  task: PrivateCreativeTaskWithDefaultsDto;
}

export default function PrivateCreativeTaskInvitationsPage() {
  const { task } = useOutletContext<OutletCtx>();

  return <CreativeTaskWhitelistSection task={task} />;
}
