import { Card, CardContent } from "@senler/ui";

/**
 * Подпункт «Приглашения в задачу»: управление вайтлистом задачи.
 */
export default function CreativeTaskInvitationsPage() {
  return (
    <Card className="border border-border">
      <CardContent className="p-4 text-sm text-muted-foreground sm:p-6">
        Индивидуальные приглашения теперь настраиваются в приватных задачах.
      </CardContent>
    </Card>
  );
}
