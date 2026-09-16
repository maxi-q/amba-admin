import { createContext } from "react";
import type { Participant } from "@/hooks/ambassador/participants";

export type TeamRole = NonNullable<Participant["role"]>;
export interface TeamMember extends Participant { role: TeamRole }

// No team endpoint exists yet. Only the development entry supplies these fixtures.
export const TeamPreviewContext = createContext<TeamMember[] | null>(null);
export const teamRoleLabels: Record<TeamRole, string> = {
  owner: "Владелец", admin: "Администратор", editor: "Редактор", viewer: "Наблюдатель",
};
