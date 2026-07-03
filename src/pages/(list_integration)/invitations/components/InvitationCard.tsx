import { Trash2 } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@senler/ui";
import type { BaseAfterRegistrationInvitationDto } from "@/api/generated/model";

interface InvitationCardProps {
  invitation: BaseAfterRegistrationInvitationDto;
  resolveTaskLabel: (id: string) => string;
  resolveEventLabel: (id: string) => string;
  onDelete: (invitation: BaseAfterRegistrationInvitationDto) => void;
  showLinkedEntities?: boolean;
}

function IdLine({
  label,
  ids,
  resolve,
}: {
  label: string;
  ids: string[];
  resolve: (id: string) => string;
}) {
  const safe = ids ?? [];
  if (safe.length === 0) {
    return <p className="text-sm text-muted-foreground">{label}: —</p>;
  }
  return (
    <div>
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {safe.map((id) => (
          <Badge key={id} variant="secondary" className="font-normal">
            {resolve(id)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function InvitationCard({
  invitation,
  resolveTaskLabel,
  resolveEventLabel,
  onDelete,
  showLinkedEntities = true,
}: InvitationCardProps) {
  const vkTargets = invitation.targets ?? [];
  const privateTaskIds = invitation.privateTaskIds ?? [];
  const eventIds = invitation.eventIds ?? [];

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              Подписчики ВК (subscriberId)
            </p>
            {vkTargets.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            ) : (
              <div className="mt-1 flex flex-wrap gap-1">
                {vkTargets.map((t, i) => (
                  <Badge
                    key={`${t.subscriberId}-${i}`}
                    variant="outline"
                    className="font-mono text-xs font-normal"
                  >
                    {t.subscriberId}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Источник:</span>
              <Badge variant="outline" className="text-xs sm:text-sm">
                После регистрации
              </Badge>
            </div>
            <p className="mt-2 block text-xs text-muted-foreground">
              Создано: {new Date(invitation.createdAt).toLocaleString("ru-RU")}
            </p>
            {showLinkedEntities ? (
              <div className="mt-3 flex flex-col gap-3">
                <IdLine label="Индивидуальные задачи" ids={privateTaskIds} resolve={resolveTaskLabel} />
                <IdLine label="События" ids={eventIds} resolve={resolveEventLabel} />
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-destructive hover:bg-destructive/10"
              aria-label="Удалить"
              onClick={() => onDelete(invitation)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
