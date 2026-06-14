import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  InputField,
  PageLoader,
} from "@senler/ui";
import type { OrdFileResponseDto } from "@/api/generated/model";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import {
  useOrdRoomFileTemplateActions,
  useOrdRoomFileTemplates,
} from "@/hooks/ord/useOrdRoomFileTemplates";
import { formatOrdFileSize } from "@/utils/ordFileUpload";
import { ORD_COPY } from "./ord.constants";
import { formatOrdDate } from "./ord.utils";
import {
  canDownloadOrdFile,
  canUploadOrdFileBody,
  ORD_FILE_STATUS_LABELS,
  ordFileStatusVariant,
} from "./ordFile.utils";
import { DeleteOrdRoomFileDialog } from "./components/DeleteOrdRoomFileDialog";
import { UploadOrdRoomFileSheet } from "./components/UploadOrdRoomFileSheet";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function OrdRoomFilesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filenameFilter, setFilenameFilter] = useState<string | undefined>();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<OrdFileResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrdFileResponseDto | null>(null);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const filesQuery = useOrdRoomFileTemplates({
    roomId,
    params: { page, size: 10, filename: filenameFilter },
    enabled: !!roomId,
  });
  const actions = useOrdRoomFileTemplateActions(roomId);

  const applySearch = useDebouncedCallback((value: string) => {
    setFilenameFilter(value.trim() || undefined);
    setPage(1);
  }, 300);

  const hasOrdProfile = !!room?.ordPerson;
  const totalPages = filesQuery.pagination?.totalPages ?? 0;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    applySearch(value);
  };

  const runAction = async (fileId: string, action: () => Promise<void>, successMessage: string) => {
    setActionError("");
    setPendingFileId(fileId);

    try {
      await action();
      toast.success(successMessage);
    } catch (actionErr) {
      setActionError(errorMessage(actionErr, "Не удалось выполнить действие"));
    } finally {
      setPendingFileId(null);
    }
  };

  const handleCreateAndUpload = async (title: string, file: File) => {
    await actions.createAndUpload(title, file);
    toast.success("Файл загружен и поставлен в очередь синхронизации с ОРД");
  };

  const handleUploadBody = async (_title: string, file: File) => {
    if (!uploadTarget) return;

    await actions.uploadBody(uploadTarget.id, file);
    toast.success("Тело файла загружено");
    setUploadTarget(null);
  };

  const handleDownload = (file: OrdFileResponseDto) => {
    void runAction(file.id, () => actions.download(file.id), "Ссылка на скачивание открыта");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await runAction(deleteTarget.id, () => actions.remove(deleteTarget.id), "ORD-файл удалён");
    setDeleteTarget(null);
  };

  const emptyStateMessage = useMemo(() => {
    if (filenameFilter) return "По вашему запросу файлов не найдено.";
    return "ORD-файлов пока нет. Добавьте первый шаблон медиафайла для комнаты.";
  }, [filenameFilter]);

  if (isRoomLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(error, ORD_COPY.roomNotFound)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{ORD_COPY.filesTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Шаблоны медиафайлов комнаты для ВК ОРД. Загрузка идёт напрямую в хранилище, затем файл синхронизируется.
          </p>
        </div>
        <Button type="button" size="lg" onClick={() => setCreateSheetOpen(true)} disabled={!hasOrdProfile}>
          {ORD_COPY.addOrdFile}
        </Button>
      </div>

      {!hasOrdProfile ? (
        <Alert className="mb-4">
          <AlertDescription>
            {ORD_COPY.noOrdProfileHint}{" "}
            <RouterLink
              to={`/rooms/${slug}/ord/profile`}
              className="font-medium text-primary underline underline-offset-2"
            >
              Перейти к профилю ОРД
            </RouterLink>
          </AlertDescription>
        </Alert>
      ) : null}

      {actionError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}

      {filesQuery.isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage(filesQuery.error, "Не удалось загрузить ORD-файлы")}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4">
        <InputField
          value={searchInput}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск ORD-файлов"
        />
      </div>

      {filesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <PageLoader label="Загрузка файлов…" />
        </div>
      ) : filesQuery.files.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyStateMessage}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Название</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Статус</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Размер</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Синхронизация</th>
                  <th className="px-3 py-2.5 text-right font-medium text-foreground" />
                </tr>
              </thead>
              <tbody>
                {filesQuery.files.map((file) => {
                  const isRowPending = pendingFileId === file.id;

                  return (
                    <tr key={file.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2.5 align-top">
                        <span className="font-medium text-foreground">{file.title}</span>
                        {file.contentType ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{file.contentType}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <Badge variant={ordFileStatusVariant(file.status)}>
                          {ORD_FILE_STATUS_LABELS[file.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 align-top text-foreground">
                        {formatOrdFileSize(file.sizeBytes)}
                      </td>
                      <td className="px-3 py-2.5 align-top text-foreground">
                        {file.syncedAt ? formatOrdDate(file.syncedAt) : file.uploadedAt ? "В очереди" : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          {canUploadOrdFileBody(file.status) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isRowPending || !hasOrdProfile}
                              onClick={() => setUploadTarget(file)}
                            >
                              Загрузить
                            </Button>
                          ) : null}
                          {canDownloadOrdFile(file.status) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isRowPending}
                              onClick={() => handleDownload(file)}
                            >
                              Скачать
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isRowPending || !hasOrdProfile}
                            onClick={() => setDeleteTarget(file)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Назад
              </Button>
              <span className="min-w-[4.5rem] text-center text-sm text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Вперёд
              </Button>
            </div>
          ) : null}
        </>
      )}

      <UploadOrdRoomFileSheet
        open={createSheetOpen}
        title={ORD_COPY.addOrdFile}
        onClose={() => setCreateSheetOpen(false)}
        onSubmit={handleCreateAndUpload}
      />

      <UploadOrdRoomFileSheet
        open={!!uploadTarget}
        title="Загрузить тело файла"
        initialName={uploadTarget?.title ?? ""}
        lockName
        submitLabel="Загрузить файл"
        pendingLabel="Загрузка файла…"
        onClose={() => setUploadTarget(null)}
        onSubmit={handleUploadBody}
      />

      <DeleteOrdRoomFileDialog
        open={!!deleteTarget}
        fileName={deleteTarget?.title ?? ""}
        isPending={pendingFileId === deleteTarget?.id}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
