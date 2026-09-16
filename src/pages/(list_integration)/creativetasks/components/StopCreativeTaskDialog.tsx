import { X } from "lucide-react";
import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";

interface StopCreativeTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFrozen: boolean;
  isPending?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
}

export function StopCreativeTaskDialog({
  open,
  onOpenChange,
  isFrozen,
  isPending = false,
  errorMessage,
  onConfirm,
}: StopCreativeTaskDialogProps) {
  const title = isFrozen ? "Возобновить задание" : "Остановить задание";

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[358px] max-w-[calc(100vw-32px)] gap-0 overflow-hidden rounded-lg border-0 p-0 sm:max-w-[358px]"
      >
        <DialogHeader className="relative flex-row items-center justify-between gap-3 border-b border-[#e4e4e4] px-4 py-2.5 text-left">
          <DialogTitle className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
            {title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label="Закрыть"
            >
              <X className="size-4" strokeWidth={1.5} aria-hidden />
            </Button>
          </DialogClose>
        </DialogHeader>

        <DialogDescription className="px-4 py-2 text-left text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
          {isFrozen
            ? "Исполнители снова смогут отправлять ответы, а модерация станет доступна."
            : "Задание останется видимым, но новые ответы и модерация будут недоступны."}
        </DialogDescription>

        {errorMessage ? (
          <p className="px-4 pb-2 text-[13px] text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <DialogFooter className="px-4 py-2.5">
          <Button
            type="button"
            size="sm"
            className="h-7 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Сохранение…" : title.replace(" задание", "")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
