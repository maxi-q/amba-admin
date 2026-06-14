import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@senler/ui";

interface OrdRoomFilesSummaryCardProps {
  to: string;
  disabled?: boolean;
  disabledText?: string;
}

export function OrdRoomFilesSummaryCard({
  to,
  disabled = false,
  disabledText,
}: OrdRoomFilesSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ORD-файлы комнаты</CardTitle>
        <CardDescription>
          Шаблоны медиафайлов для ВК ОРД: загрузка в хранилище и синхронизация.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <p className="text-sm text-muted-foreground">
            {disabledText ?? "Управление ORD-файлами сейчас недоступно."}
          </p>
        ) : (
          <Link
            to={to}
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
          >
            Управлять ORD-файлами
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
