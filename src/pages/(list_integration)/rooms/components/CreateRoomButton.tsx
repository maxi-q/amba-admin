import { Button } from "@senler/ui";

interface CreateRoomButtonProps {
  onClick: () => void;
}

export const CreateRoomButton = ({ onClick }: CreateRoomButtonProps) => {
  return (
    <div className="mb-4 mt-2 flex flex-row justify-start">
      <Button type="button" onClick={onClick} size="lg">
        Создать комнату
      </Button>
    </div>
  );
};
