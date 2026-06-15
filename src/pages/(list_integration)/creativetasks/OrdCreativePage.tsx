import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, Button, Card, CardContent } from "@senler/ui";
import type { CreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { useUpdateCreativeTask } from "@/hooks/creativetasks/useUpdateCreativeTask";
import { ORD_COPY } from "../ord/ord.constants";
import { OrdCreativeFormFields } from "./components/OrdCreativeFormFields";
import {
  ordCreativeFormToPayload,
  taskToOrdCreativeForm,
  validateOrdCreativeForm,
  type OrdCreativeFormState,
} from "./ordCreative.utils";

interface OutletCtx {
  task: CreativeTaskWithDefaultsDto;
}

const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] ?? "";

export default function OrdCreativePage() {
  const { slug, taskId } = useParams<{ slug: string; taskId: string }>();
  const { task } = useOutletContext<OutletCtx>();
  const [form, setForm] = useState<OrdCreativeFormState>(() => taskToOrdCreativeForm(task));
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const {
    updateCreativeTask,
    isPending,
    isValidationError,
    validationErrors,
    generalError,
    isSuccess,
  } = useUpdateCreativeTask();

  useEffect(() => {
    setForm(taskToOrdCreativeForm(task));
  }, [task]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Настройки креатива ОРД сохранены");
    }
  }, [isSuccess]);

  const serverFieldErrors = useMemo(() => {
    if (!isValidationError) return {};
    const mapped: Record<string, string> = {};
    for (const [key, messages] of Object.entries(validationErrors)) {
      if (messages[0]) mapped[key] = messages[0];
    }
    return mapped;
  }, [isValidationError, validationErrors]);

  const fieldErrors = { ...clientErrors, ...serverFieldErrors };
  const disabled = task.isDeleted;

  const handleSave = () => {
    const errors = validateOrdCreativeForm(form);
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    updateCreativeTask({
      id: task.id,
      data: ordCreativeFormToPayload(form),
    });
  };

  return (
    <div className="space-y-4 pb-6">
      {generalError ? (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      ) : null}

      {disabled ? (
        <Alert>
          <AlertDescription>Для удалённой задачи редактирование креатива ОРД недоступно.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <OrdCreativeFormFields
            form={form}
            setForm={setForm}
            roomId={task.roomId}
            roomSlug={slug ?? ""}
            disabled={disabled}
            fieldErrors={fieldErrors}
          />

          {!disabled ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button type="button" onClick={handleSave} disabled={isPending}>
                {isPending ? ORD_COPY.savePending : ORD_COPY.save}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">Связанные настройки</h2>
          <p className="text-sm text-muted-foreground">
            Автовыпуск ORD-договоров настраивается отдельно от параметров креатива.
          </p>
          <Link
            to={`/rooms/${slug}/creativetasks/${taskId}/ord-auto-issuance`}
            className="inline-flex text-sm text-primary hover:underline"
          >
            Перейти к автовыпуску договоров
          </Link>
        </CardContent>
      </Card>

      {isValidationError && Object.keys(serverFieldErrors).length > 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            {getFirstFieldError(validationErrors, Object.keys(serverFieldErrors)[0]) ||
              "Проверьте заполнение полей формы."}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
