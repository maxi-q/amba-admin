import { InputField } from "@senler/ui";
import type { FioParts } from "@/utils/fio";
import { ORD_COPY } from "../ord.constants";

type Props = {
  value: FioParts;
  onChange: (patch: Partial<FioParts>) => void;
  /** Ошибка API по полю `name` (одна на всё ФИО). */
  apiNameError?: string;
  /** Показывать ошибки обязательности по пустым полям. */
  showRequiredErrors: boolean;
};

function fieldError(isEmpty: boolean, showRequiredErrors: boolean, apiNameError?: string): boolean {
  return !!apiNameError || (showRequiredErrors && isEmpty);
}

function fieldHelper(
  slot: "first" | "rest",
  isEmpty: boolean,
  showRequiredErrors: boolean,
  apiNameError?: string
): string | undefined {
  if (slot === "first" && apiNameError) return apiNameError;
  if (slot === "rest" && apiNameError) return undefined;
  if (showRequiredErrors && isEmpty) return ORD_COPY.requiredField;
  return undefined;
}

function FieldBlock({
  legend,
  ariaLabel,
  value,
  onChange,
  error,
  helperText,
}: {
  legend: string;
  ariaLabel: string;
  value: string;
  onChange: (v: string) => void;
  error: boolean;
  helperText?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {legend}
        <span className="text-destructive" aria-hidden>
          {" "}
          *
        </span>
      </p>
      <InputField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={helperText}
        aria-label={ariaLabel}
      />
    </div>
  );
}

/**
 * Три обязательных поля: Имя, Фамилия, Отчество (в API склеиваются как «Фамилия Имя Отчество»).
 */
export function FioTextFields({ value, onChange, apiNameError, showRequiredErrors }: Props) {
  return (
    <div className="grid max-w-md gap-3">
      <FieldBlock
        legend="Имя"
        ariaLabel="Имя"
        value={value.given}
        onChange={(v) => onChange({ given: v })}
        error={fieldError(!value.given.trim(), showRequiredErrors, apiNameError)}
        helperText={fieldHelper("first", !value.given.trim(), showRequiredErrors, apiNameError)}
      />
      <FieldBlock
        legend="Фамилия"
        ariaLabel="Фамилия"
        value={value.family}
        onChange={(v) => onChange({ family: v })}
        error={fieldError(!value.family.trim(), showRequiredErrors, apiNameError)}
        helperText={fieldHelper("rest", !value.family.trim(), showRequiredErrors, apiNameError)}
      />
      <FieldBlock
        legend="Отчество"
        ariaLabel="Отчество"
        value={value.patronymic}
        onChange={(v) => onChange({ patronymic: v })}
        error={fieldError(!value.patronymic.trim(), showRequiredErrors, apiNameError)}
        helperText={fieldHelper("rest", !value.patronymic.trim(), showRequiredErrors, apiNameError)}
      />
    </div>
  );
}
