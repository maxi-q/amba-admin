import type { UploadUrlResponseDto } from "@/api/generated/model";

export async function uploadOrdFileToPresignedUrl(
  file: File,
  upload: UploadUrlResponseDto,
  contentType?: string
): Promise<void> {
  if (file.size > upload.maxBytes) {
    throw new Error(
      `Файл слишком большой (${formatOrdFileSize(file.size)}). Максимум ${formatOrdFileSize(upload.maxBytes)}.`
    );
  }

  const resolvedContentType = contentType || file.type || undefined;

  const response = await fetch(upload.url, {
    method: "PUT",
    body: file,
    headers: resolvedContentType ? { "Content-Type": resolvedContentType } : undefined,
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить файл в хранилище");
  }
}

export function formatOrdFileSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} Б`;

  const units = ["КБ", "МБ", "ГБ"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
