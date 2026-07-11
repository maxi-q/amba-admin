import { useId, useRef } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@senler/ui";
import type { CompanyAvatarDraft } from "../types/companyAvatar";

interface CompanyAvatarPickerProps {
  draft: CompanyAvatarDraft;
  error?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
}

export function CompanyAvatarPicker({
  draft,
  error,
  disabled = false,
  onFileSelect,
}: CompanyAvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Аватар</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted"
          aria-hidden={!draft.previewUrl}
        >
          {draft.previewUrl ? (
            <img
              src={draft.previewUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <User className="size-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            PNG или JPEG, минимум 200×200 px
          </p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            disabled={disabled}
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Plus className="size-4" aria-hidden />
            Добавить
          </Button>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
