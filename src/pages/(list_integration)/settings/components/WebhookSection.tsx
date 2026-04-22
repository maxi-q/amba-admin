import { Link } from "react-router-dom";
import { Copy, RefreshCw } from "lucide-react";
import { Button, InputField } from "@senler/ui";
import { getFirstFieldError, hasFieldError } from "@services/config/axios.helper";

interface WebhookSectionProps {
  webhookUrl: string;
  secretKey: string;
  slug?: string;
  fieldErrors?: Record<string, string[]>;
  isUpdating: boolean;
  isRotating: boolean;
  onWebhookUrlChange: (value: string) => void;
  onSaveWebhook: () => void;
  onCopySecretKey: () => void;
  onRotateSecretKey: () => void;
}

export const WebhookSection = ({
  webhookUrl,
  secretKey,
  slug,
  fieldErrors,
  isUpdating,
  isRotating,
  onWebhookUrlChange,
  onSaveWebhook,
  onCopySecretKey,
  onRotateSecretKey,
}: WebhookSectionProps) => {
  const errs = fieldErrors ?? {};

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Адрес</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <InputField
              value={webhookUrl}
              onChange={(e) => onWebhookUrlChange(e.target.value)}
              error={hasFieldError(errs, "webhookUrl")}
              helperText={getFirstFieldError(errs, "webhookUrl") ?? undefined}
              aria-label="URL вебхука"
            />
          </div>
          <Button
            type="button"
            size="lg"
            className="h-10 shrink-0 self-start"
            onClick={onSaveWebhook}
            disabled={isUpdating}
          >
            {isUpdating ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        На этот адрес будут отправляться запросы после того как привлечённый
        пользователь активировал промокод
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Секретный ключ</p>
        <div className="flex flex-row items-start gap-2">
          <div className="min-w-0 flex-1">
            <InputField
              type="password"
              readOnly
              value={secretKey || ""}
              aria-label="Секретный ключ"
              endAdornment={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={onCopySecretKey}
                  aria-label="Скопировать секретный ключ"
                >
                  <Copy className="size-4" />
                </Button>
              }
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="size-10 shrink-0 p-0"
            onClick={onRotateSecretKey}
            disabled={isRotating}
            aria-label="Обновить секретный ключ"
          >
            <RefreshCw
              className={`size-4 ${isRotating ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {slug ? (
        <Link
          to={`/rooms/${slug}/setting/info`}
          className="text-sm text-primary underline underline-offset-4 hover:text-primary/90"
        >
          описание формата вебхука
        </Link>
      ) : null}
    </div>
  );
};
