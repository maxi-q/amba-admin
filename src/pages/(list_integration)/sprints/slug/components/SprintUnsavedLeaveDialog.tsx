import {
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";
import dialogCloseUrl from "../assets/dialog-close.svg";

interface SprintUnsavedLeaveDialogProps {
  open: boolean;
  onStay: () => void;
  onLeaveWithoutSaving: () => void;
  onSaveDraft: () => void;
}

export function SprintUnsavedLeaveDialog({
  open,
  onStay,
  onLeaveWithoutSaving,
  onSaveDraft,
}: SprintUnsavedLeaveDialogProps) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        if (!next) onStay();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-[min(358px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[358px]"
      >
        <DialogHeader className="flex-row items-center gap-4 space-y-0 px-4 py-2.5">
          <DialogTitle className="flex-1 text-left text-[15px] font-medium leading-5 tracking-[-0.135px]">
            Сохранить черновик
          </DialogTitle>
          <button
            type="button"
            className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden"
            onClick={onStay}
            aria-label="Закрыть"
          >
            <img
              src={dialogCloseUrl}
              alt=""
              width={13}
              height={13}
              className="size-[13px] shrink-0"
            />
          </button>
        </DialogHeader>

        <div className="px-4 py-2">
          <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
            Уверены, что хотите выйти без сохранения? Данные будут утеряны
          </p>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 px-4 py-2.5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
            onClick={onLeaveWithoutSaving}
          >
            Без сохранения
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 bg-[#2563eb] px-2 text-[13px] font-medium hover:bg-[#2563eb]/90"
            onClick={onSaveDraft}
          >
            Сохранить черновик
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
