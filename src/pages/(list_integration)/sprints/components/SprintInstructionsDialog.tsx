import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";
import closeIcon from "@/assets/sprint-instructions/close.svg";
import { SprintInstructions } from "./SprintInstructions";

interface SprintInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SprintInstructionsDialog = ({
  open,
  onOpenChange,
}: SprintInstructionsDialogProps) => (
  <DialogRoot open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      className="flex h-[596px] max-h-[calc(100dvh-32px)] w-[358px] max-w-[calc(100vw-32px)] flex-col gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:max-w-[358px]"
    >
      <DialogHeader className="h-11 shrink-0 flex-row items-center gap-4 space-y-0 px-4 py-2.5 text-left">
        <DialogTitle className="min-w-0 flex-1 text-[15px] font-medium leading-5 tracking-[-0.135px]">
          Как это работает
        </DialogTitle>
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label="Закрыть"
            className="size-6 shrink-0 p-0"
          >
            <img src={closeIcon} alt="" />
          </Button>
        </DialogClose>
        <DialogDescription className="sr-only">
          Инструкция по созданию и проведению спринта
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <SprintInstructions placement="dialog" />
      </div>
    </DialogContent>
  </DialogRoot>
);
