import { Alert, AlertDescription, Button } from "@senler/ui";

interface CreativeTasksErrorStateProps {
  errorMessage?: string;
}

export function CreativeTasksErrorState({ errorMessage }: CreativeTasksErrorStateProps) {
  return (
    <div className="w-full px-2 py-6">
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Ошибка при загрузке задач: {errorMessage ?? "Неизвестная ошибка"}
        </AlertDescription>
      </Alert>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          window.location.reload();
        }}
      >
        Попробовать снова
      </Button>
    </div>
  );
}
