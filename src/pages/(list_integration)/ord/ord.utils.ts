import type { IOrdContractType, IOrdJuridicalType, IRoomOrdProfile } from "@services/rooms/rooms.types";
import { ORD_CONTRACT_TYPE_OPTIONS, ORD_JURIDICAL_OPTIONS } from "./ord.constants";

export function formatOrdDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU");
}

export function ordContractTypeLabel(type: IOrdContractType): string {
  return ORD_CONTRACT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

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
