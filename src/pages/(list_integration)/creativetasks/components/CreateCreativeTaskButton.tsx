import { Button } from "@senler/ui";

interface CreateCreativeTaskButtonProps {
  onClick: () => void;
}

export function CreateCreativeTaskButton({ onClick }: CreateCreativeTaskButtonProps) {
  return (
    <Button type="button" size="lg" onClick={onClick}>
      Создать задачу
    </Button>
  );
}
