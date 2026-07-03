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

export const CREATIVE_TASK_FORMAT_LABELS = {
  STORY: 'История',
  POST: 'Пост',
  ARTICLE: 'Статья',
  VIDEO: 'Видео',
} as const;

export type CreativeTaskFormat = keyof typeof CREATIVE_TASK_FORMAT_LABELS;

export const CREATIVE_TASK_FORMAT_OPTIONS = Object.entries(CREATIVE_TASK_FORMAT_LABELS).map(
  ([value, label]) => ({ value: value as CreativeTaskFormat, label })
);

export function parseMultilineList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((format) => format.trim())
        .filter(Boolean)
    )
  );
}

export function formatMultilineList(items: string[] | undefined): string {
  return items?.join('\n') ?? '';
}

export function parseRewardBalls(value: string): number {
  if (!value.trim()) return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatBallsReward(value: number | undefined): string {
  const reward = value ?? 0;
  if (reward === 0) {
    return 'Без баллов';
  }

  return `${reward} баллов`;
}

export function formatRubReward(value: number | undefined): string {
  const reward = value ?? 0;
  if (reward === 0) {
    return 'Без оплаты';
  }

  return `${reward} ₽`;
}

export function formatTaskFormat(format: string): string {
  return CREATIVE_TASK_FORMAT_LABELS[format as CreativeTaskFormat] ?? format;
}
