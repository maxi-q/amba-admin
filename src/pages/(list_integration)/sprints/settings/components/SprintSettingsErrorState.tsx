import { Alert, AlertDescription } from "@senler/ui";

interface SprintSettingsErrorStateProps {
  roomError?: string;
  sprintsError?: string;
  projectError?: string;
}

export const SprintSettingsErrorState = ({
  roomError,
  sprintsError,
  projectError,
}: SprintSettingsErrorStateProps) => {
  return (
    <div className="w-full px-4 py-6">
      {roomError ? (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>
            Ошибка при загрузке комнаты: {roomError}
          </AlertDescription>
        </Alert>
      ) : null}
      {sprintsError ? (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>
            Ошибка при загрузке спринтов: {sprintsError}
          </AlertDescription>
        </Alert>
      ) : null}
      {projectError ? (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>
            Ошибка при загрузке проекта: {projectError}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
