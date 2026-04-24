import { Alert, AlertDescription, Button } from "@senler/ui";

interface EventsErrorStateProps {
  /** Сообщение об ошибке */
  errorMessage?: string;
}

/**
 * Компонент для отображения состояния ошибки при загрузке событий
 * Показывает сообщение об ошибке и кнопку для повторной попытки
 */
export const EventsErrorState = ({ errorMessage }: EventsErrorStateProps) => {
  return (
    <div className="w-full px-4 py-6">
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Ошибка при загрузке событий:{" "}
          {errorMessage ?? "Неизвестная ошибка"}
        </AlertDescription>
      </Alert>
      <Button type="button" variant="outline" onClick={() => window.location.reload()}>
        Попробовать снова
      </Button>
    </div>
  );
};
