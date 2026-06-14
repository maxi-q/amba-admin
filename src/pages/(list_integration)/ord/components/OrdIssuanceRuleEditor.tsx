import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardHeader, CardTitle, PageLoader } from "@senler/ui";
import {
  useRoomOrdIssuanceRule,
  useTaskOrdIssuanceRule,
  useUpsertRoomOrdIssuanceRule,
  useUpsertTaskOrdIssuanceRule,
} from "@/hooks/ord/useOrdIssuanceRule";
import { OrdIssuanceRuleFormFields } from "./OrdIssuanceRuleFormFields";
import { ORD_COPY } from "../ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "../ord.utils";
import {
  buildUpsertOrdIssuanceRulePayload,
  emptyOrdTemplateForm,
  ordTemplateFormFromTemplate,
  type OrdTemplateFormState,
} from "../ordTemplateForm.utils";

type OrdIssuanceRuleScope =
  | { type: "room"; roomId: string }
  | { type: "creativeTask"; roomId: string; taskId: string };

interface OrdIssuanceRuleEditorProps {
  scope: OrdIssuanceRuleScope;
  roomSlug: string;
  hasOrdProfile: boolean;
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
  disabled?: boolean;
  disabledText?: string;
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function OrdIssuanceRuleEditor({
  scope,
  roomSlug,
  hasOrdProfile,
  title,
  description,
  backTo,
  backLabel,
  disabled = false,
  disabledText,
}: OrdIssuanceRuleEditorProps) {
  const [form, setForm] = useState<OrdTemplateFormState>(() => emptyOrdTemplateForm());
  const [initialized, setInitialized] = useState(false);

  const roomRuleQuery = useRoomOrdIssuanceRule({
    roomId: scope.roomId,
    enabled: scope.type === "room" && !disabled,
  });
  const taskRuleQuery = useTaskOrdIssuanceRule({
    roomId: scope.roomId,
    taskId: scope.type === "creativeTask" ? scope.taskId : "",
    enabled: scope.type === "creativeTask" && !disabled,
  });

  const ruleQuery = scope.type === "room" ? roomRuleQuery : taskRuleQuery;
  const upsertRoom = useUpsertRoomOrdIssuanceRule(scope.roomId);
  const upsertTask = useUpsertTaskOrdIssuanceRule(
    scope.roomId,
    scope.type === "creativeTask" ? scope.taskId : ""
  );
  const upsert = scope.type === "room" ? upsertRoom : upsertTask;

  useEffect(() => {
    if (ruleQuery.isLoading || initialized) return;

    if (ruleQuery.rule) {
      setForm(ordTemplateFormFromTemplate(ruleQuery.rule.template, ruleQuery.rule.isActive));
    } else if (ruleQuery.isNotConfigured) {
      setForm(emptyOrdTemplateForm());
    }

    if (ruleQuery.rule || ruleQuery.isNotConfigured) {
      setInitialized(true);
    }
  }, [initialized, ruleQuery.isLoading, ruleQuery.isNotConfigured, ruleQuery.rule]);

  const handleSubmit = () => {
    if (!form.name.trim() || disabled || !hasOrdProfile) return;

    upsert.mutate(buildUpsertOrdIssuanceRulePayload(form), () => {
      toast.success(ruleQuery.rule ? "Автовыпуск обновлён" : "Автовыпуск настроен");
      setInitialized(false);
    });
  };

  const mutationError = upsert.generalError || upsert.validationErrors.name?.[0];

  if (ruleQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <PageLoader label="Загрузка правила автовыпуска…" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <RouterLink
        to={backTo}
        className="mb-3 inline-flex text-sm font-medium text-primary underline underline-offset-2"
      >
        {backLabel}
      </RouterLink>

      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {!hasOrdProfile ? (
        <Alert className="mb-4">
          <AlertDescription>
            {ORD_COPY.noOrdProfileHint}{" "}
            <RouterLink
              to={`/rooms/${roomSlug}/ord/profile`}
              className="font-medium text-primary underline underline-offset-2"
            >
              Перейти к профилю ОРД
            </RouterLink>
          </AlertDescription>
        </Alert>
      ) : null}

      {disabled ? (
        <Alert className="mb-4">
          <AlertDescription>{disabledText ?? "Настройка автовыпуска сейчас недоступна."}</AlertDescription>
        </Alert>
      ) : null}

      {ruleQuery.isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {errorMessage(ruleQuery.error, "Не удалось загрузить правило автовыпуска")}
          </AlertDescription>
        </Alert>
      ) : null}

      {mutationError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{mutationError}</AlertDescription>
        </Alert>
      ) : null}

      {ruleQuery.rule ? (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Текущее правило</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Статус:{" "}
              <Badge variant={ruleQuery.rule.isActive ? "secondary" : "outline"}>
                {ruleQuery.rule.isActive ? "Активно" : "Отключено"}
              </Badge>
            </p>
            <p>
              Шаблон: <span className="text-foreground">{ruleQuery.rule.template.name}</span> (
              {ordContractTypeLabel(ruleQuery.rule.template.type)})
            </p>
            <p>Обновлено: {formatOrdDate(ruleQuery.rule.updatedAt)}</p>
          </CardContent>
        </Card>
      ) : ruleQuery.isNotConfigured ? (
        <Alert className="mb-4">
          <AlertDescription>
            Автовыпуск ещё не настроен. Заполните форму ниже и сохраните — будет создан шаблон и правило
            выпуска.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {ruleQuery.rule ? "Изменить автовыпуск" : "Настроить автовыпуск"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrdIssuanceRuleFormFields form={form} setForm={setForm} />
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={!form.name.trim() || upsert.isPending || disabled || !hasOrdProfile}
          >
            {upsert.isPending ? ORD_COPY.savePending : ORD_COPY.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
