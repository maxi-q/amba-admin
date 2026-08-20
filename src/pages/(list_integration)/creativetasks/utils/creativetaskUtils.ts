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
