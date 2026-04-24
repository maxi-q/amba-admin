import { Alert, AlertDescription } from "@senler/ui";

export const EventNotFoundState = () => {
  return (
    <div className="w-full px-4 py-6">
      <Alert>
        <AlertDescription>Событие не найдено</AlertDescription>
      </Alert>
    </div>
  );
};
