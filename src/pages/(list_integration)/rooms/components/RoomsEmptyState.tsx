import { Alert, AlertDescription } from "@senler/ui";

interface RoomsEmptyStateProps {
  onCreateClick: () => void;
}

export const RoomsEmptyState = ({ onCreateClick }: RoomsEmptyStateProps) => {
  return (
    <Alert className="mb-6">
      <AlertDescription>
        Нет созданных комнат.{" "}
        <button
          type="button"
          onClick={onCreateClick}
          className="font-medium text-primary underline underline-offset-2"
        >
          Создайте первую комнату
        </button>
        .
      </AlertDescription>
    </Alert>
  );
};
