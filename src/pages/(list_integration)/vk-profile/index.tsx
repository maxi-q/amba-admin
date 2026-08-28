import { ExternalLink } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageLoader,
} from "@senler/ui";
import { toast } from "sonner";
import { useVkAuth } from "@/hooks/vk-auth/useVkAuth";

export default function VkProfilePage() {
  const {
    status,
    isLoading,
    isError,
    error,
    refetch,
    getAuthorizationUrl,
    isConnecting,
  } = useVkAuth();

  const handleConnect = async () => {
    const popup = window.open("about:blank", "vkAuthPopup", "width=600,height=760");
    if (!popup) {
      toast.error("Разрешите всплывающие окна, чтобы подключить профиль VK");
      return;
    }

    try {
      const authorization = await getAuthorizationUrl();
      popup.location.replace(authorization.url);
    } catch {
      popup.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <PageLoader label="Проверяем подключение VK…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-1 py-2 sm:px-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Профиль VK</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Подключите личный профиль VK для действий от имени пользователя.
        </p>
      </div>

      {isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error ? error.message : "Не удалось проверить подключение VK"}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>VK ID</CardTitle>
              <CardDescription className="mt-1">
                Авторизация откроется в отдельном окне.
              </CardDescription>
            </div>
            <Badge variant={status?.authorized ? "secondary" : "outline"}>
              {status?.authorized ? "Подключён" : "Не подключён"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {status?.authorized ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">VK ID</dt>
                <dd className="mt-1 font-medium text-foreground">{status.vkUserId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Действует до</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {status.expiresAt ? new Date(status.expiresAt).toLocaleString("ru-RU") : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Профиль ещё не подключён или авторизация больше не действует.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleConnect} disabled={isConnecting}>
              <ExternalLink className="size-4" aria-hidden />
              {isConnecting
                ? "Открываем VK…"
                : status?.authorized
                  ? "Переподключить профиль"
                  : "Подключить профиль"}
            </Button>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Проверить подключение
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
