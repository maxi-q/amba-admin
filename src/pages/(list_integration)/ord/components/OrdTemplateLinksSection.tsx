import { useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InputField,
  PageLoader,
} from "@senler/ui";
import {
  useCreateOrdTemplateLink,
  useDeactivateOrdTemplateLink,
  useOrdTemplateLinks,
  type OrdTemplateLinkEntityType,
  type OrdTemplateLinkItem,
} from "@/hooks/ord/useOrdTemplateLinks";
import { ordContractTypeLabel } from "../ord.utils";

interface OrdTemplateLinksSectionProps {
  roomId: string;
  entityId: string;
  entityType: OrdTemplateLinkEntityType;
  title: string;
  description: string;
  disabled?: boolean;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function OrdTemplateLinksSection({
  roomId,
  entityId,
  entityType,
  title,
  description,
  disabled = false,
}: OrdTemplateLinksSectionProps) {
  const {
    templates,
    isLoading,
    queryError,
  } = useOrdTemplateLinks({
    roomId,
    entityId,
    entityType,
  });
  const createTemplateLink = useCreateOrdTemplateLink({ roomId, entityId, entityType });
  const deactivateTemplateLink = useDeactivateOrdTemplateLink({ roomId });
  const [search, setSearch] = useState("");
  const visibleTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...templates]
      .filter((template) => template.name.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => {
        if (a.linked !== b.linked) return a.linked ? -1 : 1;

        return a.name.localeCompare(b.name, "ru");
      });
  }, [search, templates]);
  const linkedCount = templates.filter((template) => template.linked).length;
  const mutationError = createTemplateLink.error ?? deactivateTemplateLink.error;
  const isPending = createTemplateLink.isPending || deactivateTemplateLink.isPending;
  const pendingTemplateId = createTemplateLink.pendingTemplateId ?? deactivateTemplateLink.pendingTemplateId;

  const handleTemplateLinkChange = (template: OrdTemplateLinkItem) => {
    if (template.linked) {
      if (!template.ruleId) return;

      deactivateTemplateLink.mutate({
        templateId: template.id,
        ruleId: template.ruleId,
      });
      return;
    }

    createTemplateLink.mutate(template.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <InputField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по названию"
            aria-label="Поиск ORD-шаблонов"
          />
          <p className="text-sm text-muted-foreground">
            Подключено: {linkedCount} из {templates.length}
          </p>
        </div>

        {queryError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {getErrorMessage(queryError, "Не удалось загрузить ORD-шаблоны")}
            </AlertDescription>
          </Alert>
        ) : null}

        {mutationError ? (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(mutationError, "Не удалось изменить привязку шаблона")}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-6">
            <PageLoader label="Загрузка шаблонов…" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            В комнате пока нет ORD-шаблонов. Создайте их во вкладке ОРД → Шаблоны.
          </p>
        ) : visibleTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground">По этому названию шаблоны не найдены</p>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleTemplates.map((template) => {
              const isItemPending = pendingTemplateId === template.id;

              return (
                <label
                  key={template.id}
                  className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-border p-3 text-sm leading-snug"
                >
                  <span className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      checked={template.linked}
                      disabled={disabled || isPending || !template.isDetailLoaded}
                      onChange={() => handleTemplateLinkChange(template)}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{template.name}</span>
                      <span className="mt-0.5 block text-muted-foreground">
                        {ordContractTypeLabel(template.type)} · CID {template.autoGetCid ? "автоматически" : "вручную"}
                      </span>
                    </span>
                  </span>
                  {isItemPending ? <Badge variant="secondary">Сохранение…</Badge> : null}
                </label>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
