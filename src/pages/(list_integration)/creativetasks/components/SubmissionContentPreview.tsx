import type { BaseCreativeTaskSubmissionDto } from "@/api/generated/model";
import { getSubmissionPreviewText } from "../submissionContent.utils";

type SubmissionContentPreviewProps = {
  submission: Pick<
    BaseCreativeTaskSubmissionDto,
    "texts" | "targetUrls" | "mediaFileIds" | "erid"
  >;
  compact?: boolean;
};

export function SubmissionContentPreview({
  submission,
  compact = false,
}: SubmissionContentPreviewProps) {
  if (compact) {
    return (
      <p className="min-w-0 flex-1 truncate text-sm text-foreground">
        {getSubmissionPreviewText(submission)}
      </p>
    );
  }

  const texts = submission.texts?.map((text) => text.trim()).filter(Boolean) ?? [];
  const targetUrls = submission.targetUrls?.filter(Boolean) ?? [];
  const mediaCount = submission.mediaFileIds?.length ?? 0;

  if (texts.length === 0 && targetUrls.length === 0 && mediaCount === 0 && !submission.erid) {
    return <p className="text-sm text-foreground">—</p>;
  }

  return (
    <div className="space-y-2 text-sm text-foreground">
      {texts.length > 0 ? (
        <div className="space-y-1">
          {texts.map((text, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {text}
            </p>
          ))}
        </div>
      ) : null}

      {targetUrls.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Ссылки:</p>
          {targetUrls.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-primary underline underline-offset-2"
            >
              {url}
            </a>
          ))}
        </div>
      ) : null}

      {mediaCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          Медиафайлов: {mediaCount}
        </p>
      ) : null}

      {submission.erid ? (
        <p className="text-xs text-muted-foreground">erid: {submission.erid}</p>
      ) : null}
    </div>
  );
}
