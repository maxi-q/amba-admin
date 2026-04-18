import type { IOrdJuridicalType, IRoomOrdProfile } from "@services/rooms/rooms.types";
import { ORD_JURIDICAL_OPTIONS } from "./ord.constants";

export function ordJuridicalLabel(type: IOrdJuridicalType): string {
  return ORD_JURIDICAL_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export type OrdSyncPresentation = { label: string; color: "default" | "success" | "error" };

export function getOrdSyncPresentation(profile: IRoomOrdProfile): OrdSyncPresentation {
  if (profile.lastSyncError) {
    return { label: "Ошибка синхронизации", color: "error" };
  }
  if (profile.syncedAt) {
    return { label: "Синхронизировано", color: "success" };
  }
  return { label: "Ожидает синхронизации", color: "default" };
}
