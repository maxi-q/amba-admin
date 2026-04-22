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
import { X } from "lucide-react";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

interface CreateRoomDialogProps {
  open: boolean;
  formData: {
    name: string;
    webhookUrl: string;
  };
  fieldErrors: Record<string, string[]>;
  generalError: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CreateRoomDialog = ({
  open,
  formData,
  fieldErrors,
  generalError,
  isPending,
  onClose,
  onSubmit,
  onInputChange,
}: CreateRoomDialogProps) => {
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex !h-[100dvh] !max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0"
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
            Создать новую комнату
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-6">
          {generalError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          ) : null}

          <InputField
            autoFocus
            label="Название комнаты"
            value={formData.name}
            onChange={onInputChange("name")}
            error={hasFieldError(fieldErrors, "name")}
            helperText={getFirstFieldError(fieldErrors, "name") ?? undefined}
          />
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!formData.name.trim() || isPending}
            onClick={onSubmit}
          >
            {isPending ? "Создание…" : "Создать"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
