import { Button } from "@senler/ui";

interface SprintActionButtonsProps {
  isNewSprint: boolean;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export const SprintActionButtons = ({
  isNewSprint,
  onSave,
  onDelete,
  isCreating,
  isUpdating,
}: SprintActionButtonsProps) => {
  const isLoading = isCreating || isUpdating;

  return (
    <div className="mt-6 flex flex-wrap justify-end gap-2">
      {!isNewSprint ? (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isLoading}
        >
          Удалить
        </Button>
      ) : null}
      <Button type="button" onClick={onSave} disabled={isLoading}>
        {isLoading
          ? isNewSprint
            ? "Создание…"
            : "Сохранение…"
          : isNewSprint
            ? "Добавить"
            : "Сохранить"}
      </Button>
    </div>
  );
};
