import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useEvents } from "@/hooks/events/useEvents";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import {
  useCreateOrdTemplateRule,
  useDeactivateOrdTemplateRule,
  useOrdTemplateRules,
  useOrdTemplates,
} from "@/hooks/ord/useOrdTemplateRules";
import type { CreateOrdContractIssuanceRuleRequestDtoSourceType } from "@/api/generated/model";
import { ORD_COPY } from "./ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "./ord.utils";

const SOURCE_TYPE_OPTIONS: { value: CreateOrdContractIssuanceRuleRequestDtoSourceType; label: string }[] = [
  { value: "room", label: "Комната" },
  { value: "event", label: "Событие" },
  { value: "creativeTask", label: "Творческая задача" },
];

const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const sourceTypeLabel = (value: string) =>
  SOURCE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

export default function OrdTemplateRulesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [sourceType, setSourceType] = useState<CreateOrdContractIssuanceRuleRequestDtoSourceType>("room");
  const [sourceId, setSourceId] = useState("");
  const templatesQuery = useOrdTemplates({ roomId, enabled: !!roomId });
  const eventsQuery = useEvents({ page: 1, size: 100 }, sourceType === "event" ? slug ?? "" : "");
  const tasksQuery = useRoomCreativeTasks(sourceType === "creativeTask" ? roomId : "", { page: 1, size: 100 });
  const rulesQuery = useOrdTemplateRules({
    roomId,
    templateId: selectedTemplateId,
    enabled: !!selectedTemplateId,
  });
  const createRule = useCreateOrdTemplateRule({
    roomId,
    templateId: selectedTemplateId,
    enabled: !!selectedTemplateId,
  });
  const deactivateRule = useDeactivateOrdTemplateRule({
    roomId,
    templateId: selectedTemplateId,
    enabled: !!selectedTemplateId,
  });
  const selectedTemplate = useMemo(
    () => templatesQuery.templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templatesQuery.templates]
  );
  const mutationError = createRule.error ?? deactivateRule.error;
  const isMutationPending = createRule.isPending || deactivateRule.isPending;
  const activeRules = rulesQuery.rules.filter((rule) => rule.isActive);
  const sourceOptions = useMemo(() => {
    if (sourceType === "event") {
      return eventsQuery.events.map((event) => ({ id: event.id, label: event.name }));
    }
    if (sourceType === "creativeTask") {
      return tasksQuery.tasks.map((task) => ({ id: task.id, label: task.title }));
    }

    return [];
  }, [eventsQuery.events, sourceType, tasksQuery.tasks]);
  const isSourceOptionsLoading =
    sourceType === "event"
      ? eventsQuery.isLoading
      : sourceType === "creativeTask"
        ? tasksQuery.isLoading
        : false;
  const sourceOptionsError =
    sourceType === "event" ? eventsQuery.error : sourceType === "creativeTask" ? tasksQuery.error : null;
  const sourceOptionsErrorMessage =
    sourceType === "event" ? "Не удалось загрузить события" : "Не удалось загрузить творческие задачи";
  const sourcePlaceholder = sourceType === "event" ? "Выберите событие" : "Выберите творческую задачу";
  const sourceIdForCreate = sourceType === "room" ? roomId : sourceId;

  useEffect(() => {
    if (!selectedTemplateId && templatesQuery.templates.length > 0) {
      setSelectedTemplateId(templatesQuery.templates[0].id);
    }
  }, [selectedTemplateId, templatesQuery.templates]);

  const handleSourceTypeChange = (value: string) => {
    const nextSourceType = value as CreateOrdContractIssuanceRuleRequestDtoSourceType;

    setSourceType(nextSourceType);
    setSourceId("");
    createRule.reset();
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    createRule.reset();
    deactivateRule.reset();
  };

  const handleCreateRule = () => {
    if (!selectedTemplateId || !sourceIdForCreate) return;

    createRule.mutate({
      sourceType,
      sourceId: sourceIdForCreate,
    });
  };

  if (isRoomLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка..." />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(error, ORD_COPY.roomNotFound)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{ORD_COPY.templateRulesTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Настройте, для каких комнат, событий и творческих задач шаблон будет выпускать ORD-договоры.
          </p>
        </div>
        <RouterLink to={`/rooms/${slug}/ord/templates`} className="text-sm font-medium text-primary underline underline-offset-2">
          К шаблонам
        </RouterLink>
      </div>

      {!room.ordPerson ? (
        <Alert className="mb-4">
          <AlertDescription>
            {ORD_COPY.noOrdProfileHint}{" "}
            <RouterLink to={`/rooms/${slug}/ord/profile`} className="font-medium text-primary underline underline-offset-2">
              Перейти к профилю ОРД
            </RouterLink>
          </AlertDescription>
        </Alert>
      ) : null}

      {templatesQuery.isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage(templatesQuery.error, "Не удалось загрузить шаблоны")}</AlertDescription>
        </Alert>
      ) : null}

      {templatesQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <PageLoader label="Загрузка шаблонов..." />
        </div>
      ) : templatesQuery.templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Шаблонов пока нет.{" "}
          <RouterLink to={`/rooms/${slug}/ord/templates`} className="font-medium text-primary underline underline-offset-2">
            Создайте шаблон
          </RouterLink>
          , чтобы добавить правила выпуска.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(18rem,22rem)_1fr]">
          <section className="space-y-4 rounded-lg border border-border p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Шаблон</p>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Выберите шаблон" />
                </SelectTrigger>
                <SelectContent>
                  {templatesQuery.templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate ? (
              <div className="rounded-md bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">{selectedTemplate.name}</p>
                <p className="mt-1 text-muted-foreground">
                  {ordContractTypeLabel(selectedTemplate.type)} · CID{" "}
                  {selectedTemplate.autoGetCid ? "автоматически" : "вручную"}
                </p>
                <p className="mt-2 text-muted-foreground">Активных правил: {activeRules.length}</p>
              </div>
            ) : null}

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium text-foreground">Добавить или реактивировать правило</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Если такое правило уже было отключено, backend повторно активирует его.
                </p>
              </div>

              {mutationError ? (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage(mutationError, "Не удалось изменить правило")}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Источник аудитории</p>
                <Select value={sourceType} onValueChange={handleSourceTypeChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {sourceType === "room" ? (
                <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                  Правило будет применяться ко всей комнате.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {sourceType === "event" ? "Событие" : "Творческая задача"}
                  </p>

                  {sourceOptionsError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage(sourceOptionsError, sourceOptionsErrorMessage)}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Select value={sourceId} onValueChange={setSourceId} disabled={isSourceOptionsLoading}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder={isSourceOptionsLoading ? "Загрузка..." : sourcePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!isSourceOptionsLoading && sourceOptions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {sourceType === "event" ? "В комнате пока нет событий." : "В комнате пока нет творческих задач."}
                    </p>
                  ) : null}
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={handleCreateRule}
                disabled={
                  !selectedTemplateId ||
                  !sourceIdForCreate ||
                  isMutationPending ||
                  isSourceOptionsLoading ||
                  !room.ordPerson
                }
              >
                {createRule.isPending ? "Добавление..." : "Добавить правило"}
              </Button>
            </div>
          </section>

          <section className="min-w-0">
            {rulesQuery.isError ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage(rulesQuery.error, "Не удалось загрузить правила")}</AlertDescription>
              </Alert>
            ) : null}

            {rulesQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <PageLoader label="Загрузка правил..." />
              </div>
            ) : rulesQuery.rules.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                У выбранного шаблона пока нет правил выпуска.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 py-2.5 text-left font-medium text-foreground">Источник</th>
                      <th className="px-3 py-2.5 text-left font-medium text-foreground">ID источника</th>
                      <th className="px-3 py-2.5 text-left font-medium text-foreground">Статус</th>
                      <th className="px-3 py-2.5 text-left font-medium text-foreground">Создано</th>
                      <th className="px-3 py-2.5 text-right font-medium text-foreground" />
                    </tr>
                  </thead>
                  <tbody>
                    {rulesQuery.rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2.5 align-top text-foreground">{sourceTypeLabel(rule.sourceType)}</td>
                        <td className="px-3 py-2.5 align-top font-mono text-xs text-foreground">{rule.sourceId}</td>
                        <td className="px-3 py-2.5 align-top">
                          <Badge variant={rule.isActive ? "secondary" : "outline"}>
                            {rule.isActive ? "Активно" : "Отключено"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 align-top text-foreground">{formatOrdDate(rule.createdAt)}</td>
                        <td className="px-3 py-2.5 text-right align-top">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!rule.isActive || deactivateRule.isPending || !room.ordPerson}
                            onClick={() => deactivateRule.mutate(rule.id)}
                          >
                            {deactivateRule.isPending ? "Отключение..." : "Отключить"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
