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

export function parseAllowedFormatsInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((format) => format.trim())
        .filter(Boolean)
    )
  );
}

export function formatAllowedFormatsInput(formats: string[] | undefined): string {
  return formats?.join('\n') ?? '';
}

export function parseRewardBalls(value: string): number {
  if (!value.trim()) return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatRewardRange(guaranteed: number | undefined, max: number | undefined): string {
  const guaranteedValue = guaranteed ?? 0;
  const maxValue = max ?? 0;

  if (guaranteedValue === 0 && maxValue === 0) {
    return 'Без баллов';
  }

  if (maxValue === guaranteedValue) {
    return `${guaranteedValue} баллов`;
  }

  return `${guaranteedValue}–${maxValue} баллов`;
}
