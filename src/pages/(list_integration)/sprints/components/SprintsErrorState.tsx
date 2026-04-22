import { Alert, AlertDescription, Button } from "@senler/ui";

interface SprintsErrorStateProps {
  errorMessage?: string;
}

export const SprintsErrorState = ({ errorMessage }: SprintsErrorStateProps) => {
  return (
    <div className="w-full px-4 py-6">
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Ошибка при загрузке спринтов:{" "}
          {errorMessage ?? "Неизвестная ошибка"}
        </AlertDescription>
      </Alert>
      <Button type="button" variant="outline" onClick={() => window.location.reload()}>
        Попробовать снова
      </Button>
    </div>
  );
};
