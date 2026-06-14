import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";

interface UploadOrdRoomFileSheetProps {
  open: boolean;
  title: string;
  initialName?: string;
  submitLabel?: string;
  pendingLabel?: string;
  lockName?: boolean;
  onClose: () => void;
  onSubmit: (name: string, file: File) => Promise<void>;
}

export function UploadOrdRoomFileSheet({
  open,
  title,
  initialName = "",
  submitLabel = "Загрузить",
  pendingLabel = "Загрузка…",
  lockName = false,
  onClose,
  onSubmit,
}: UploadOrdRoomFileSheetProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setError("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [initialName, open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
      setError("");
      setIsPending(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const file = selectedFile ?? fileInputRef.current?.files?.[0] ?? null;

    if (!trimmedName) {
      setError("Укажите название файла");
      return;
    }

    if (!file) {
      setError("Выберите файл для загрузки");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      await onSubmit(trimmedName, file);
      handleOpenChange(false);
      setName("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось загрузить файл");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex !max-h-[min(100dvh,36rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => handleOpenChange(false)}
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Название *</p>
            <InputField
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Как файл будет называться в ОРД"
              aria-label="Название ORD-файла"
              disabled={isPending || lockName}
              readOnly={lockName}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Файл *</p>
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              disabled={isPending}
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <p className="text-xs text-muted-foreground">
                Выбран: {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} КБ)
              </p>
            ) : null}
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4">
          <Button type="button" variant="outline" size="lg" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button type="button" size="lg" onClick={() => void handleSubmit()} disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
