/**
 * Форматирует диапазон дат задачи
 */
export function formatDateRange(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt || !endsAt) return 'Без ограничений по дате';

  const start = new Date(startsAt);
  const end = new Date(endsAt);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  return `${formatDate(start)} — ${formatDate(end)}`;
}

/**
 * Проверяет, активна ли задача в текущий момент
 */
export function isTaskActive(startsAt: string | null, endsAt: string | null): boolean {
  const now = new Date();
  const start = new Date(startsAt || '');
  const end = new Date(endsAt || '');
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end;
}
