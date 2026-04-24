import { Check, X } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@senler/ui";
import type { IRoomApplication, IEventApplication } from "@services/ambassador/ambassador.types";

interface ApplicationCardProps {
  application: IRoomApplication | IEventApplication;
  type: "room" | "event";
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessedThis: boolean;
  showActions?: boolean;
  eventName?: string;
  ambassadorName?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getJuridicalTypeLabel = (type: string) => {
  switch (type) {
    case "physical":
      return "Физ. лицо";
    case "ip":
      return "ИП";
    case "juridical":
      return "Юр. лицо";
    default:
      return type;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Ожидает";
    case "approved":
      return "Одобрено";
    case "rejected":
      return "Отклонено";
    default:
      return status;
  }
};

const getStatusBadgeVariant = (
  status: string
): "warning" | "success" | "error" | "secondary" => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "secondary";
  }
};

export const ApplicationCard = ({
  application,
  type,
  onApprove,
  isProcessedThis,
  onReject,
  showActions = true,
  eventName,
  ambassadorName,
}: ApplicationCardProps) => {
  const isRoomApplication = type === "room";
  const isEventApplication = type === "event";
  const roomApp = application as IRoomApplication;

  return (
    <Card className="border-border">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {isRoomApplication && roomApp.name ? (
              <p className="text-sm font-medium text-foreground">{roomApp.name}</p>
            ) : null}
            {isEventApplication && eventName ? (
              <p className="text-sm font-medium text-foreground">{eventName}</p>
            ) : null}
            {isRoomApplication && roomApp.juridicalType ? (
              <Badge variant="outline" className="text-xs font-normal">
                {getJuridicalTypeLabel(roomApp.juridicalType)}
              </Badge>
            ) : null}
            <Badge
              variant={getStatusBadgeVariant(application.status)}
              className="text-xs font-normal"
            >
              {getStatusLabel(application.status)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {isRoomApplication && roomApp.phone ? (
              <p className="text-sm text-muted-foreground">Телефон: {roomApp.phone}</p>
            ) : null}
            {isRoomApplication && roomApp.inn ? (
              <p className="text-sm text-muted-foreground">ИНН: {roomApp.inn}</p>
            ) : null}
            {isEventApplication ? (
              <p className="text-sm text-muted-foreground">
                Амбассадор: {ambassadorName || application.ambassadorId}
              </p>
            ) : null}
            {isRoomApplication ? (
              <p className="text-sm text-muted-foreground">
                ID амбассадора: {application.ambassadorId}
              </p>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Создано: {formatDate(application.createdAt)}
          </p>
        </div>

        {showActions ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => onApprove(application.id)}
              disabled={isProcessedThis}
            >
              <Check className="size-4" />
              {isProcessedThis ? "Загрузка…" : "Одобрить"}
            </Button>
            {isRoomApplication ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onReject(application.id)}
                disabled={isProcessedThis}
              >
                <X className="size-4" />
                {isProcessedThis ? "…" : "Отклонить"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
