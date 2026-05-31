import { format } from "date-fns";
import { roomsControllerGetRoomPromoCodeUsages } from "@/api/generated/rooms/rooms";
import type {
  GetRoomPromoCodeUsagesResponseDto,
  RoomsControllerGetRoomPromoCodeUsagesParams,
} from "@/api/generated/model";

const EXPORT_PAGE_SIZE = 500;

type PromoCodeUsage = GetRoomPromoCodeUsagesResponseDto["items"][number];
type NamedEntity = { id: string; name: string };

interface ExportPromoCodeUsagesCsvParams {
  roomId: string;
  filters: Omit<RoomsControllerGetRoomPromoCodeUsagesParams, "page" | "size">;
  sprints: NamedEntity[];
  events: NamedEntity[];
}

export function getPromoCodeUsageTargetName(
  usage: PromoCodeUsage,
  sprints: NamedEntity[],
  events: NamedEntity[]
) {
  if (usage.sprintId) {
    const sprint = sprints.find((s) => s.id === usage.sprintId);
    return sprint?.name || "Спринт";
  }

  if (usage.eventId) {
    const event = events.find((e) => e.id === usage.eventId);
    return event?.name || "Событие";
  }

  return "Не указано";
}

export function getPromoCodeUsageTargetType(usage: PromoCodeUsage) {
  if (usage.sprintId) return "Спринт";
  if (usage.eventId) return "Событие";
  return "";
}

function getPromoCodeFromPayload(payload: unknown) {
  if (!payload) return "";

  if (typeof payload === "string") {
    try {
      return getPromoCodeFromPayload(JSON.parse(payload));
    } catch {
      return payload;
    }
  }

  if (typeof payload === "object" && "promoCode" in payload) {
    const promoCode = (payload as { promoCode?: unknown }).promoCode;
    return promoCode == null ? "" : String(promoCode);
  }

  return "";
}

function escapeCsvCell(value: unknown) {
  const stringValue = value == null ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map(escapeCsvCell).join(";"))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function fetchAllPromoCodeUsages(
  roomId: string,
  filters: Omit<RoomsControllerGetRoomPromoCodeUsagesParams, "page" | "size">
) {
  const allUsages: PromoCodeUsage[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await roomsControllerGetRoomPromoCodeUsages(roomId, {
      ...filters,
      page,
      size: EXPORT_PAGE_SIZE,
    });

    allUsages.push(...response.items);
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);

  return allUsages;
}

export async function exportPromoCodeUsagesCsv({
  roomId,
  filters,
  sprints,
  events,
}: ExportPromoCodeUsagesCsvParams) {
  const usages = await fetchAllPromoCodeUsages(roomId, filters);

  if (usages.length === 0) {
    throw new Error("Нет промокодов для выгрузки по выбранным фильтрам.");
  }

  const rows = [
    [
      "Промокод",
      "Тип",
      "Событие/спринт",
      "Дата применения",
      "ID амбассадора",
      "ID пользователя",
      "Дополнительный ID пользователя",
    ],
    ...usages.map((usage) => [
      getPromoCodeFromPayload(usage.payload),
      getPromoCodeUsageTargetType(usage),
      getPromoCodeUsageTargetName(usage, sprints, events),
      usage.createdAt ? format(new Date(usage.createdAt), "dd.MM.yyyy HH:mm") : "",
      usage.ambassadorId ?? "",
      usage.uniqueId ?? "",
      usage.additionalUniqueId ?? "",
    ]),
  ];

  downloadCsv(
    `promo-code-usages-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`,
    rows
  );
}
