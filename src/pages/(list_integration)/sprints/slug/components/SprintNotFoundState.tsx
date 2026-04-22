import { Alert, AlertDescription } from "@senler/ui";

export const SprintNotFoundState = () => {
  return (
    <div className="px-4 py-6">
      <Alert variant="destructive">
        <AlertDescription>Спринт не найден</AlertDescription>
      </Alert>
    </div>
  );
};
