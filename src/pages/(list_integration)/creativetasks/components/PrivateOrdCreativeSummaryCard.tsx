import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@senler/ui";
import type { PrivateCreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { getPrivateOrdCreativeSummaryLines } from "../privateOrdCreative.utils";

interface PrivateOrdCreativeSummaryCardProps {
  task: PrivateCreativeTaskWithDefaultsDto;
}

export function PrivateOrdCreativeSummaryCard({ task }: PrivateOrdCreativeSummaryCardProps) {
  const { slug, privateTaskId } = useParams<{ slug: string; privateTaskId: string }>();
  const lines = getPrivateOrdCreativeSummaryLines(task);
  const to = `/rooms/${slug}/creativetasks/private/${privateTaskId}/ord-creative`;

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
            Для удалённой индивидуальной задачи настройка креатива ОРД недоступна.
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
