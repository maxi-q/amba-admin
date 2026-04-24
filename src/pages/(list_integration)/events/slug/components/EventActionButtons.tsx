import { Button } from "@senler/ui";

interface EventActionButtonsProps {
  isNewEvent: boolean;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isCheckingPrefix: boolean;
}

export const EventActionButtons = ({
  isNewEvent,
  onSave,
  onDelete,
  isCreating,
  isUpdating,
  isCheckingPrefix,
}: EventActionButtonsProps) => {
  const isLoading = isCreating || isUpdating || isCheckingPrefix;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {!isNewEvent && (
        <Button
          type="button"
          variant="outline"
          className="min-w-[7.5rem] border-destructive text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          disabled={isUpdating}
        >
          Удалить
        </Button>
      )}
      <Button
        type="button"
        variant="default"
        className="min-w-[7.5rem]"
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading
          ? "Сохранение…"
          : (isNewEvent ? "Добавить" : "Сохранить")}
      </Button>
    </div>
  );
};
