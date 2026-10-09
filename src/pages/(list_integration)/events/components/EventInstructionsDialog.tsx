import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@senler/ui";
import { X } from "lucide-react";
import { EventInstructions } from "./EventInstructions";

interface EventInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventInstructionsDialog = ({
  open,
  onOpenChange,
}: EventInstructionsDialogProps) => (
  <DialogRoot open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      className="flex h-[648px] max-h-[calc(100dvh-32px)] w-[358px] max-w-[calc(100vw-32px)] flex-col gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:max-w-[358px]"
    >
      <DialogHeader className="h-11 shrink-0 flex-row items-center gap-4 space-y-0 px-4 py-2.5 text-left">
        <DialogTitle className="flex-1 text-[15px] font-medium leading-5 tracking-[-0.135px]">
          Как это работает
        </DialogTitle>
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label="Закрыть"
            className="size-6 shrink-0 p-0 text-[#707070]"
          >
            <X className="size-6" strokeWidth={1.5} />
          </Button>
        </DialogClose>
        <DialogDescription className="sr-only">
          Инструкция по созданию и проведению события
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <EventInstructions placement="dialog" />
      </div>
    </DialogContent>
  </DialogRoot>
);
