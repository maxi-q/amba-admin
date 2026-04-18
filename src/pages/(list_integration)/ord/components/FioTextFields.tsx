import { Stack, TextField } from "@mui/material";
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

/**
 * Три обязательных поля: Имя, Фамилия, Отчество (в API склеиваются как «Фамилия Имя Отчество»).
 */
export function FioTextFields({ value, onChange, apiNameError, showRequiredErrors }: Props) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Имя"
        size="small"
        required
        value={value.given}
        onChange={(e) => onChange({ given: e.target.value })}
        error={fieldError(!value.given.trim(), showRequiredErrors, apiNameError)}
        helperText={fieldHelper("first", !value.given.trim(), showRequiredErrors, apiNameError)}
      />
      <TextField
        label="Фамилия"
        size="small"
        required
        value={value.family}
        onChange={(e) => onChange({ family: e.target.value })}
        error={fieldError(!value.family.trim(), showRequiredErrors, apiNameError)}
        helperText={fieldHelper("rest", !value.family.trim(), showRequiredErrors, apiNameError)}
      />
      <TextField
        label="Отчество"
        size="small"
        required
        value={value.patronymic}
        onChange={(e) => onChange({ patronymic: e.target.value })}
        error={fieldError(!value.patronymic.trim(), showRequiredErrors, apiNameError)}
        helperText={fieldHelper("rest", !value.patronymic.trim(), showRequiredErrors, apiNameError)}
      />
    </Stack>
  );
}
