import { getSubmissionLink, getSubmissionPreviewText, type SubmissionWithItems } from "../submissionContent.utils";

function ContentLink({ value }: { value: string }) {
  const href = getSubmissionLink(value);
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="block break-words text-[#2563eb] [overflow-wrap:anywhere]">{value}</a>
    : <span className="block break-words text-[#797979] [overflow-wrap:anywhere]">{value} (некорректная ссылка)</span>;
}

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
  return (
    <div className="space-y-3 text-[13px] font-medium leading-4 text-black">
      {items.length === 0 && <p className="text-[#797979]">Материалы пока не отправлены</p>}
      {items.map((item, itemIndex) => {
        const texts = item.texts?.map((text) => text.trim()).filter(Boolean) ?? [];
        const targetUrls = item.targetUrls?.filter(Boolean) ?? [];
        const mediaCount = item.mediaFileIds?.length ?? 0;

        return (
          <div
            key={itemIndex}
            className="space-y-1"
          >
            {items.length > 1 ? (
              <p className="text-xs font-medium text-muted-foreground">
                Публикация {itemIndex + 1}
              </p>
            ) : null}

            {texts.length > 0 ? (
              <div className="space-y-1 text-xs leading-4">
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
                  <ContentLink key={index} value={url} />
                ))}
              </div>
            ) : null}

            {item.publicationUrl ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Ссылка на публикацию:
                </p>
                <ContentLink value={item.publicationUrl} />
              </div>
            ) : null}

            {mediaCount > 0 ? (
              <div className="rounded-md border border-[#e4e4e4] p-2 text-xs text-[#797979]">
                <p>Медиафайлов: {mediaCount}. Просмотр пока недоступен: сервер не возвращает ссылки для проверяющего.</p>
                <details className="mt-1"><summary className="cursor-pointer">Идентификаторы файлов</summary><ul className="mt-1 space-y-1 break-all">{item.mediaFileIds?.map((id, index) => <li key={`${id}-${index}`}>{id}</li>)}</ul></details>
              </div>
            ) : null}

            {item.erid ? (
              <p className="text-xs text-muted-foreground">erid: {item.erid}</p>
            ) : null}

            {texts.length === 0 &&
            targetUrls.length === 0 &&
            mediaCount === 0 &&
            !item.publicationUrl &&
            !item.erid ? (
              <p className="text-muted-foreground">—</p>
            ) : null}
          </div>
        );
      })}
      {submission.comment?.trim() && <div className="space-y-1"><p className="text-[#797979]">Комментарий исполнителя</p><p className="whitespace-pre-wrap rounded-md bg-[#f0f0f0] p-1 text-xs leading-4">{submission.comment}</p></div>}
    </div>
  );
}
