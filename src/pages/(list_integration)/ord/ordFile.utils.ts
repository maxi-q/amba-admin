import type { OrdFileResponseDtoStatus } from "@/api/generated/model";

export const ORD_FILE_STATUS_LABELS: Record<OrdFileResponseDtoStatus, string> = {
  draft: "Черновик",
  pending: "Синхронизация с ОРД",
  synced: "Синхронизирован",
  error: "Ошибка синхронизации",
};

export const ordFileStatusVariant = (
  status: OrdFileResponseDtoStatus
): "secondary" | "outline" | "destructive" | "default" => {
  if (status === "synced") return "secondary";
  if (status === "error") return "destructive";
  return "outline";
};

export const canUploadOrdFileBody = (status: OrdFileResponseDtoStatus) => status === "draft";

export const canDownloadOrdFile = (status: OrdFileResponseDtoStatus) =>
  status === "pending" || status === "synced" || status === "error";
