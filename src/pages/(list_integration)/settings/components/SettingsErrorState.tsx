import { Alert, AlertDescription } from "@senler/ui";

interface SettingsErrorStateProps {
  errorMessage?: string;
}

export const SettingsErrorState = ({ errorMessage }: SettingsErrorStateProps) => {
  return (
    <div className="w-full px-4 py-6">
      <Alert variant="destructive">
        <AlertDescription>
          Ошибка при загрузке комнаты:{" "}
          {errorMessage ?? "Неизвестная ошибка"}
        </AlertDescription>
      </Alert>
    </div>
  );
};
