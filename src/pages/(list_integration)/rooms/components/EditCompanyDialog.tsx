import { useEffect, useState } from "react";
import { BadgePercent, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Input,
} from "@senler/ui";
import type { GetMyRoomsResponseItemDto } from "@/api/generated/model";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";

interface EditCompanyDialogProps {
  room: GetMyRoomsResponseItemDto | null;
  open: boolean;
  isActive: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCompanyDialog({
  room,
  open,
  isActive,
  onOpenChange,
}: EditCompanyDialogProps) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const { updateRoom, isPending } = useUpdateRoom();

  useEffect(() => {
    if (!open || !room) return;
    setName(room.name);
    setNameError(null);
  }, [open, room]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!room) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Введите название компании");
      return;
    }

    if (trimmedName === room.name) {
      onOpenChange(false);
      return;
    }

    setNameError(null);
    updateRoom(
      { id: room.id, data: { name: trimmedName } },
      {
        onSuccess: () => {
          toast.success("Название компании изменено");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Не удалось изменить компанию",
          );
        },
      },
    );
  };

  const initial = room?.name.trim().charAt(0).toLocaleUpperCase("ru-RU") || "К";

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-6 w-[358px] max-w-[calc(100vw-32px)] translate-y-0 gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:top-[74px] sm:max-w-[358px]"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="h-11 flex-row items-center gap-4 space-y-0 px-4 py-2.5 text-left">
            <DialogTitle className="min-w-0 flex-1 text-[15px] font-medium leading-5 tracking-[-0.135px]">
              Редактировать компанию
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 rounded p-0"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              aria-label="Закрыть"
            >
              <X className="size-6" strokeWidth={1.5} aria-hidden />
            </Button>
          </DialogHeader>

          <div className="flex flex-col gap-3 px-4 py-2">
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                Аватар
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border text-[20px] font-medium text-white",
                    isActive ? "bg-[#141414]" : "bg-primary",
                  ].join(" ")}
                  aria-hidden
                >
                  {isActive ? (
                    <BadgePercent
                      className="size-[43px] text-[#A07AFF]"
                      strokeWidth={1.25}
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <p className="text-[12px] font-medium leading-4 text-muted-foreground">
                    PNG или JPEG, минимум 200×200 px
                  </p>
                  <span title="Для сохранения аватарки компании нужен API бэкенда">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      className="h-7 gap-1 rounded-md px-2 text-[13px] font-medium leading-4 shadow-none disabled:opacity-100"
                      aria-label="Добавить аватар — недоступно до поддержки API"
                    >
                      <Plus className="size-4" strokeWidth={1.5} aria-hidden />
                      Добавить
                    </Button>
                  </span>
                </div>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                Название <span className="text-destructive">*</span>
              </span>
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError) setNameError(null);
                }}
                maxLength={50}
                disabled={isPending}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "edit-company-name-error" : undefined}
                className="h-10 rounded-md border-border px-3 text-[13px] font-medium leading-4 tracking-[-0.0325px] shadow-none"
              />
              {nameError ? (
                <span
                  id="edit-company-name-error"
                  className="text-[12px] font-medium leading-4 text-destructive"
                  role="alert"
                >
                  {nameError}
                </span>
              ) : null}
            </label>
          </div>

          <DialogFooter className="h-12 flex-row items-center justify-end px-4 py-2.5 sm:justify-end">
            <Button
              type="submit"
              size="sm"
              className="h-7 rounded-md px-2 text-[13px] font-medium leading-4 shadow-none"
              disabled={isPending}
              loading={isPending}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
