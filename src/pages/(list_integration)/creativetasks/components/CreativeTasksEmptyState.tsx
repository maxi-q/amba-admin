import { Alert, AlertDescription } from "@senler/ui";

interface CreativeTasksEmptyStateProps {
  onCreateClick: () => void;
}

export function CreativeTasksEmptyState({ onCreateClick }: CreativeTasksEmptyStateProps) {
  return (
    <Alert className="mb-3">
      <AlertDescription>
        Креативных задач пока нет.{" "}
        <button
          type="button"
          onClick={onCreateClick}
          className="inline cursor-pointer border-0 bg-transparent p-0 align-baseline font-medium text-primary underline underline-offset-2 hover:text-primary/90"
        >
          Создайте первую задачу
        </button>
        , чтобы начать.
      </AlertDescription>
    </Alert>
  );
}
