export type SprintStatus = "active" | "upcoming" | "past";

export type SprintStatusTone = "active" | "planned" | "ended" | "draft";

export const statusLabels: Record<SprintStatus, string> = {
  active: "Активный",
  upcoming: "Запланирован",
  past: "Закончился",
};

/** Визуал чипа статуса по макету списка спринтов */
export const statusToneStyles: Record<
  SprintStatusTone,
  { chip: string; dot: string }
> = {
  active: {
    chip: "border-[#86efac] bg-[#f0fdf4] text-[#166534]",
    dot: "bg-[#22c55e]",
  },
  planned: {
    chip: "border-[#fdba74] bg-[#fff7ed] text-[#9a3412]",
    dot: "bg-[#f97316]",
  },
  ended: {
    chip: "border-[#c4b5fd] bg-[#f5f3ff] text-[#5b21b6]",
    dot: "bg-[#8b5cf6]",
  },
  draft: {
    chip: "border-[#e4e4e4] bg-[#fafafa] text-[#797979]",
    dot: "bg-[#a3a3a3]",
  },
};

export const checkSprintStatus = (
  startDate: string | null,
  endDate: string | null,
  ignoreEndDate: boolean = false
) => {
  if (ignoreEndDate) {
    return {
      status: "active" as const,
      label: statusLabels.active,
      tone: "active" as const,
    };
  }

  const now = new Date();
  const start = new Date(startDate || "");
  const end = new Date(endDate || "");

  if (!Number.isNaN(start.getTime()) && now < start) {
    return {
      status: "upcoming" as const,
      label: statusLabels.upcoming,
      tone: "planned" as const,
    };
  }

  if (
    !Number.isNaN(start.getTime()) &&
    (Number.isNaN(end.getTime()) || now <= end)
  ) {
    return {
      status: "active" as const,
      label: statusLabels.active,
      tone: "active" as const,
    };
  }

  return {
    status: "past" as const,
    label: statusLabels.past,
    tone: "ended" as const,
  };
};

/** @deprecated используйте checkSprintStatus().tone / label */
export const statusColors: Record<SprintStatus, "success" | "warning" | "default"> = {
  active: "success",
  upcoming: "warning",
  past: "default",
};
