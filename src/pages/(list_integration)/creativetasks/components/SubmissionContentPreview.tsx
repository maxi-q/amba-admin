import { getSubmissionPreviewText, type SubmissionWithItems } from "../submissionContent.utils";

type SubmissionContentPreviewProps = {
  submission: SubmissionWithItems;
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

  const items = submission.items ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-foreground">—</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => {
        const texts = item.texts?.map((text) => text.trim()).filter(Boolean) ?? [];
        const targetUrls = item.targetUrls?.filter(Boolean) ?? [];
        const mediaCount = item.mediaFileIds?.length ?? 0;

        return (
          <div
            key={itemIndex}
            className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-3 text-sm text-foreground"
          >
            {items.length > 1 ? (
              <p className="text-xs font-medium text-muted-foreground">
                Публикация {itemIndex + 1}
              </p>
            ) : null}

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
              <p className="text-xs text-muted-foreground">Медиафайлов: {mediaCount}</p>
            ) : null}

            {item.erid ? (
              <p className="text-xs text-muted-foreground">erid: {item.erid}</p>
            ) : null}

            {texts.length === 0 && targetUrls.length === 0 && mediaCount === 0 && !item.erid ? (
              <p className="text-muted-foreground">—</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
