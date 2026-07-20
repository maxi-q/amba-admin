export type SubmissionItemContent = {
  texts?: string[];
  targetUrls?: string[];
  mediaFileIds?: string[];
  erid?: string | null;
};

export type SubmissionWithItems = {
  items?: SubmissionItemContent[];
};

export function getSubmissionPreviewText(submission: SubmissionWithItems): string {
  const items = submission.items ?? [];
  if (items.length === 0) return "—";

  const first = items[0];
  const texts = first.texts?.map((text) => text.trim()).filter(Boolean) ?? [];
  if (texts.length > 0) {
    const suffix = items.length > 1 ? ` (+${items.length - 1} публ.)` : "";
    return texts.length === 1 ? `${texts[0]}${suffix}` : `${texts[0]} (+${texts.length - 1})${suffix}`;
  }

  const parts: string[] = [];
  if (items.length > 1) {
    parts.push(`${items.length} публикации`);
  } else {
    const mediaCount = first.mediaFileIds?.length ?? 0;
    const urlCount = first.targetUrls?.length ?? 0;
    if (mediaCount > 0) {
      parts.push(`${mediaCount} ${mediaCount === 1 ? "медиафайл" : "медиафайла"}`);
    }
    if (urlCount > 0) {
      parts.push(`${urlCount} ${urlCount === 1 ? "ссылка" : "ссылки"}`);
    }
    if (first.erid) {
      parts.push(`erid: ${first.erid}`);
    }
  }

  return parts.length > 0 ? parts.join(", ") : "—";
}
