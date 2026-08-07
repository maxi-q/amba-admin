export const formatDateRange = (
  startDate: string | null,
  endDate: string | null
): string => {
  if (!startDate) return "Без ограничений по дате";

  const formatDate = (date: Date) =>
    date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "Без ограничений по дате";
  if (!endDate) return `${formatDate(start)} – бессрочно`;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return `${formatDate(start)} – бессрочно`;

  return `${formatDate(start)} - ${formatDate(end)}`;
};

export const isSprintActive = (startDate: string | null, endDate: string | null): boolean => {
  const now = new Date();
  const start = new Date(startDate || '');
  const end = new Date(endDate || '');

  return now >= start && now <= end;
};

