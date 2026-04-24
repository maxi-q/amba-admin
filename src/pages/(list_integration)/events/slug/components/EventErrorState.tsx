import { Alert, AlertDescription, Button } from "@senler/ui";

interface EventErrorStateProps {
  eventsError?: string;
  projectError?: string;
}

export const EventErrorState = ({ eventsError, projectError }: EventErrorStateProps) => {
  return (
    <div className="w-full px-4 py-6">
      {eventsError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Ошибка при загрузке событий: {eventsError}</AlertDescription>
        </Alert>
      ) : null}
      {projectError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Ошибка при загрузке проекта: {projectError}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="button" variant="outline" onClick={() => window.location.reload()}>
        Попробовать снова
      </Button>
    </div>
  );
};
