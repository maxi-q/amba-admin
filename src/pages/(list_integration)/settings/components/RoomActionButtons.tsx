import { Button } from "@senler/ui";

interface RoomActionButtonsProps {
  onSave: () => void;
  onDelete: () => void;
  isUpdating: boolean;
}

export const RoomActionButtons = ({
  onSave,
  onDelete,
  isUpdating,
}: RoomActionButtonsProps) => {
  return (
    <div className="flex flex-row flex-wrap justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="destructive"
        onClick={onDelete}
        disabled={isUpdating}
      >
        Удалить
      </Button>
      <Button type="button" onClick={onSave} disabled={isUpdating}>
        {isUpdating ? "Сохранение…" : "Сохранить"}
      </Button>
    </div>
  );
};
