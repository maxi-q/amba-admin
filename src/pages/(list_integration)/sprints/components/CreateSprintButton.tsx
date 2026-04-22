import { Button } from "@senler/ui";

interface CreateSprintButtonProps {
  onClick: () => void;
}

export const CreateSprintButton = ({ onClick }: CreateSprintButtonProps) => {
  return (
    <div className="flex justify-end pt-1">
      <Button
        type="button"
        variant="outline"
        className="border-green-600/30 bg-green-500/10 text-green-800 hover:bg-green-500/20 dark:border-green-500/40 dark:text-green-400"
        onClick={onClick}
      >
        Добавить спринт
      </Button>
    </div>
  );
};
