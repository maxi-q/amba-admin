import { Alert, AlertDescription } from "@senler/ui";

interface SprintsEmptyStateProps {
  onCreateClick: () => void;
}

export const SprintsEmptyState = ({ onCreateClick }: SprintsEmptyStateProps) => {
  return (
    <Alert className="mb-3">
      <AlertDescription className="inline-block">
        Спринтов пока нет.{" "}
        <button
          type="button"
          onClick={onCreateClick}
          className=" cursor-pointer border-0 bg-transparent p-0 align-baseline font-medium text-primary underline underline-offset-2 hover:text-primary/90"
        >
          Создайте первый спринт
        </button>
        , чтобы начать работу.
      </AlertDescription>
    </Alert>
  );
};
