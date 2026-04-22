import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button, InputField, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@senler/ui";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";

interface SubmissionApproveDialogProps {
  open: boolean;
  submission: ISubmission | null;
  onClose: () => void;
  onConfirm: (params: { rewardValue: number }) => void;
  isPending: boolean;
}

export function SubmissionApproveDialog({
  open,
  submission,
  onClose,
  onConfirm,
  isPending,
}: SubmissionApproveDialogProps) {
  const [rewardValue, setRewardValue] = useState<number>(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRewardValue(0);
      setError("");
    }
  }, [open, submission?.id]);

  const handleConfirm = () => {
    if (rewardValue < 0) {
      setError("Значение награды не может быть отрицательным");
      return;
    }
    setError("");
    onConfirm({ rewardValue });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex !max-h-[min(100dvh,28rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            Одобрить ответ
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 py-4">
          {submission ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Награда (rewardValue) *</p>
              <InputField
                type="number"
                value={rewardValue === 0 ? "" : String(rewardValue)}
                onChange={(e) => {
                  const v = e.target.value;
                  setRewardValue(v === "" ? 0 : Math.max(0, Number(v)));
                }}
                error={!!error}
                helperText={error}
                aria-label="Награда"
              />
            </div>
          ) : null}
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>
            Отмена
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Сохранение…" : "Одобрить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
