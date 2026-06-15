import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@senler/ui";
import type { CreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { getOrdCreativeSummaryLines } from "../ordCreative.utils";

interface OrdCreativeSummaryCardProps {
  task: CreativeTaskWithDefaultsDto;
  slug: string;
  taskId: string;
}

export function OrdCreativeSummaryCard({ task, slug, taskId }: OrdCreativeSummaryCardProps) {
  const lines = getOrdCreativeSummaryLines(task);
  const to = `/rooms/${slug}/creativetasks/${taskId}/ord-creative`;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Креатив ОРД</CardTitle>
        <CardDescription>
          Тип креатива, коды ККТУ, дефолтные медиа и тексты для маркировки рекламы.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.isDeleted ? (
          <p className="text-sm text-muted-foreground">
            Для удалённой задачи настройка креатива ОРД недоступна.
          </p>
        ) : (
          <>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <Link
              to={to}
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
            >
              Настроить креатив ОРД
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
