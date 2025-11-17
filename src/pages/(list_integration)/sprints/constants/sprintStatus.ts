export type SprintStatus = "active" | "upcoming" | "past";

export const statusColors: Record<SprintStatus, "success" | "warning" | "default"> = {
  active: "success",
  upcoming: "warning",
  past: "default",
};

export const statusLabels: Record<SprintStatus, string> = {
  active: "активный",
  upcoming: "предстоящий",
  past: "прошедший",
};

export const checkSprintStatus = (startDate: string | null, endDate: string | null, ignoreEndDate: boolean = false) => {
  if (ignoreEndDate) {
    return { label: statusLabels.active, color: statusColors.active };
  }

  const now = new Date();
  const start = new Date(startDate || '');
  const end = new Date(endDate || '');

  if (now >= start && now <= end) {
    return { label: statusLabels.active, color: statusColors.active };
  } else if (now <= start) {
    return { label: statusLabels.upcoming, color: statusColors.upcoming };
  } else {
    return { label: statusLabels.past, color: statusColors.past };
  }
};

