import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";

type SubmissionContentFields = Pick<
  BaseCreativeTaskSubmissionDto,
  "texts" | "targetUrls" | "mediaFileIds" | "erid"
>;

export function getSubmissionPreviewText(submission: SubmissionContentFields): string {
  const texts = submission.texts?.map((text) => text.trim()).filter(Boolean) ?? [];
  if (texts.length > 0) {
    return texts.length === 1 ? texts[0] : `${texts[0]} (+${texts.length - 1})`;
  }

  const parts: string[] = [];
  const mediaCount = submission.mediaFileIds?.length ?? 0;
  const urlCount = submission.targetUrls?.length ?? 0;

  if (mediaCount > 0) {
    parts.push(`${mediaCount} ${mediaCount === 1 ? "медиафайл" : "медиафайла"}`);
  }
  if (urlCount > 0) {
    parts.push(`${urlCount} ${urlCount === 1 ? "ссылка" : "ссылки"}`);
  }
  if (submission.erid) {
    parts.push(`erid: ${submission.erid}`);
  }

  return parts.length > 0 ? parts.join(", ") : "—";
}

export function hasSubmissionContent(submission: SubmissionContentFields): boolean {
  return getSubmissionPreviewText(submission) !== "—";
}
