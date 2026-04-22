import { Alert, AlertDescription } from "@senler/ui";

export const SettingsNotFoundState = () => {
  return (
    <div className="w-full px-4 py-6">
      <Alert>
        <AlertDescription>Комната не найдена</AlertDescription>
      </Alert>
    </div>
  );
};
