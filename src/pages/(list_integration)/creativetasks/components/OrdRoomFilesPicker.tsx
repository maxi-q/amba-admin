import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, PageLoader } from "@senler/ui";
import { useOrdRoomFileTemplates } from "@/hooks/ord/useOrdRoomFileTemplates";
import { ORD_FILE_STATUS_LABELS, ordFileStatusVariant } from "../../ord/ordFile.utils";

interface OrdRoomFilesPickerProps {
  roomId: string;
  roomSlug: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export function OrdRoomFilesPicker({
  roomId,
  roomSlug,
  selectedIds,
  onChange,
  disabled = false,
  error,
}: OrdRoomFilesPickerProps) {
  const { files, isLoading } = useOrdRoomFileTemplates({
    roomId,
    params: { page: 1, size: 100 },
    enabled: !!roomId,
  });

  const selectableFiles = useMemo(
    () => files.filter((file) => file.status === "synced"),
    [files]
  );

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const file of files) {
      map.set(file.id, file.filename ?? file.title);
    }
    return map;
  }, [files]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">ORD-файлы комнаты</p>
          <p className="text-xs text-muted-foreground">
            Можно выбрать только синхронизированные файлы.
          </p>
        </div>
        <Link
          to={`/rooms/${roomSlug}/ord/files`}
          className="text-sm text-primary hover:underline"
        >
          Управление файлами
        </Link>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => (
            <Badge key={id} variant="secondary" className="max-w-full truncate font-normal">
              {labelById.get(id) ?? id}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="max-h-52 overflow-y-auto rounded-md border border-border p-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <PageLoader label="Загрузка файлов…" />
          </div>
        ) : selectableFiles.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {files.length
              ? "Нет синхронизированных ORD-файлов. Дождитесь синхронизации или добавьте новые."
              : "ORD-файлов пока нет. Добавьте их в разделе «Файлы» комнаты."}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {selectableFiles.map((file) => (
              <li key={file.id}>
                <label
                  className={`flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-muted/60 ${
                    disabled ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    checked={selectedIds.includes(file.id)}
                    disabled={disabled}
                    onChange={() => toggle(file.id)}
                  />
                  <span className="min-w-0 leading-snug">
                    <span className="font-medium">{file.filename ?? file.title}</span>
                    {file.title !== file.filename && file.filename ? (
                      <span className="text-muted-foreground"> ({file.title})</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {files.some((file) => file.status !== "synced") ? (
        <div className="flex flex-wrap gap-1.5">
          {files
            .filter((file) => file.status !== "synced")
            .slice(0, 5)
            .map((file) => (
              <Badge key={file.id} variant={ordFileStatusVariant(file.status)} className="font-normal">
                {file.title}: {ORD_FILE_STATUS_LABELS[file.status]}
              </Badge>
            ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
