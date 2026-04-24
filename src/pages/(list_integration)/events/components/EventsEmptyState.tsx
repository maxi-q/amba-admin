import { Alert, AlertDescription } from "@senler/ui";

interface EventsEmptyStateProps {
  onCreateClick: () => void;
}

export const EventsEmptyState = ({ onCreateClick }: EventsEmptyStateProps) => {
  return (
    <Alert className="mb-3">
      <AlertDescription className="inline-block">
        Событий пока нет.{" "}
        <button
          type="button"
          onClick={onCreateClick}
          className=" cursor-pointer border-0 bg-transparent p-0 align-baseline font-medium text-primary underline underline-offset-2 hover:text-primary/90"
        >
          Создайте первое событие
        </button>
        , чтобы начать работу.
      </AlertDescription>
    </Alert>
  );
};
