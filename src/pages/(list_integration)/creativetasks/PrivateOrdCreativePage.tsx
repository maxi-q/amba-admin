import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, Button, Card, CardContent } from "@senler/ui";
import type { PrivateCreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { useUpdatePrivateCreativeTask } from "@/hooks/creativetasks/useUpdatePrivateCreativeTask";
import { ORD_COPY } from "../ord/ord.constants";
import { OrdCreativeFormFields } from "./components/OrdCreativeFormFields";
import {
  privateOrdCreativeFormToPayload,
  privateTaskToOrdCreativeForm,
} from "./privateOrdCreative.utils";
import {
  validateOrdCreativeForm,
  type OrdCreativeFormState,
} from "./ordCreative.utils";

interface OutletCtx {
  task: PrivateCreativeTaskWithDefaultsDto;
}

const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] ?? "";

export default function PrivateOrdCreativePage() {
  const { slug } = useParams<{ slug: string }>();
  const { task } = useOutletContext<OutletCtx>();
  const [form, setForm] = useState<OrdCreativeFormState>(() => privateTaskToOrdCreativeForm(task));
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const {
    updatePrivateCreativeTask,
    isPending,
    isValidationError,
    validationErrors,
    generalError,
    isSuccess,
  } = useUpdatePrivateCreativeTask();

  useEffect(() => {
    setForm(privateTaskToOrdCreativeForm(task));
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

    updatePrivateCreativeTask({
      id: task.id,
      data: privateOrdCreativeFormToPayload(form),
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
          <AlertDescription>
            Для удалённой индивидуальной задачи редактирование креатива ОРД недоступно.
          </AlertDescription>
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
