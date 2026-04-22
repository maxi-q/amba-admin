import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@senler/ui";
import type { ISubmission } from "@services/creativetasks/creativetasks.types";

const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface SubmissionRejectDialogProps {
  open: boolean;
  submission: ISubmission | null;
  onClose: () => void;
  onConfirm: (params: { reviewComment: string }) => void;
  isPending: boolean;
}

export function SubmissionRejectDialog({
  open,
  submission,
  onClose,
  onConfirm,
  isPending,
}: SubmissionRejectDialogProps) {
  const [reviewComment, setReviewComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReviewComment("");
      setError("");
    }
  }, [open, submission?.id]);

  const handleConfirm = () => {
    const trimmed = reviewComment.trim();
    if (!trimmed) {
      setError("Комментарий обязателен при отклонении");
      return;
    }
    setError("");
    onConfirm({ reviewComment: trimmed });
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
        className="flex !max-h-[min(100dvh,32rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
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
            Отклонить ответ
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Комментарий (reviewComment) *</p>
            <textarea
              className={TEXTAREA_CLASS}
              value={reviewComment}
              onChange={(e) => {
                setReviewComment(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              aria-label="Комментарий"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={handleConfirm}
            disabled={isPending || !reviewComment.trim()}
          >
            {isPending ? "Сохранение…" : "Отклонить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
