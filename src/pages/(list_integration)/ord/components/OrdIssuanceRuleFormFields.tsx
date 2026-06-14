import type { Dispatch, SetStateAction } from "react";
import {
  InputField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import type { CreateOrdContractTemplateRequestDtoFlagsItem } from "@/api/generated/model";
import {
  ORD_CONTRACT_ACTION_OPTIONS,
  ORD_CONTRACT_SUBJECT_OPTIONS,
  ORD_CONTRACT_TYPE_OPTIONS,
} from "../ord.constants";
import {
  ORD_TEMPLATE_DATE_END_STRATEGY_OPTIONS,
  ORD_TEMPLATE_DATE_STRATEGY_OPTIONS,
  ORD_TEMPLATE_FLAG_OPTIONS,
  ORD_TEMPLATE_SELECT_EMPTY,
  type OrdTemplateFormState,
} from "../ordTemplateForm.utils";

interface OrdIssuanceRuleFormFieldsProps {
  form: OrdTemplateFormState;
  setForm: Dispatch<SetStateAction<OrdTemplateFormState>>;
  showActiveToggle?: boolean;
}

export function OrdIssuanceRuleFormFields({
  form,
  setForm,
  showActiveToggle = true,
}: OrdIssuanceRuleFormFieldsProps) {
  const toggleFlag = (value: CreateOrdContractTemplateRequestDtoFlagsItem) => {
    setForm((prev) => ({
      ...prev,
      flags: prev.flags.includes(value)
        ? prev.flags.filter((flag) => flag !== value)
        : [...prev.flags, value],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Название шаблона *</p>
        <InputField
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Например, договор для участников комнаты"
          aria-label="Название шаблона"
        />
      </div>

      <SelectBlock
        label="Тип договора"
        value={form.type}
        onChange={(value) =>
          setForm((prev) => ({ ...prev, type: value as OrdTemplateFormState["type"] }))
        }
        options={ORD_CONTRACT_TYPE_OPTIONS}
      />
      <SelectBlock
        label="Дата заключения"
        value={form.dateStrategy}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            dateStrategy: value as OrdTemplateFormState["dateStrategy"],
          }))
        }
        options={ORD_TEMPLATE_DATE_STRATEGY_OPTIONS}
      />
      {form.dateStrategy === "fixed" ? (
        <InputBlock
          label="Фиксированная дата заключения"
          type="date"
          value={form.fixedDate}
          onChange={(value) => setForm((prev) => ({ ...prev, fixedDate: value }))}
        />
      ) : null}
      <SelectBlock
        label="Дата окончания"
        value={form.dateEndStrategy}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            dateEndStrategy: value as OrdTemplateFormState["dateEndStrategy"],
          }))
        }
        options={ORD_TEMPLATE_DATE_END_STRATEGY_OPTIONS}
      />
      {form.dateEndStrategy === "fixed" ? (
        <InputBlock
          label="Фиксированная дата окончания"
          type="date"
          value={form.fixedDateEnd}
          onChange={(value) => setForm((prev) => ({ ...prev, fixedDateEnd: value }))}
        />
      ) : null}
      {form.dateEndStrategy === "offsetDays" ? (
        <InputBlock
          label="Сдвиг в днях"
          type="number"
          value={form.dateEndOffsetDays}
          onChange={(value) => setForm((prev) => ({ ...prev, dateEndOffsetDays: value }))}
        />
      ) : null}
      <InputBlock
        label="Сумма"
        value={form.fixedAmount}
        onChange={(value) => setForm((prev) => ({ ...prev, fixedAmount: value }))}
        placeholder="Необязательно"
      />
      <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3 text-sm leading-snug">
        <input
          type="checkbox"
          className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          checked={form.autoGetCid}
          onChange={(event) => setForm((prev) => ({ ...prev, autoGetCid: event.target.checked }))}
        />
        <span>
          <span className="block font-medium text-foreground">Автоматически запрашивать CID</span>
          <span className="block text-muted-foreground">
            Новые договоры будут вставать в очередь на получение CID.
          </span>
        </span>
      </label>
      <SelectBlock
        label="Тип действия"
        value={form.actionType || ORD_TEMPLATE_SELECT_EMPTY}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            actionType: value === ORD_TEMPLATE_SELECT_EMPTY ? "" : value,
          }))
        }
        options={[{ value: ORD_TEMPLATE_SELECT_EMPTY, label: "Не указано" }, ...ORD_CONTRACT_ACTION_OPTIONS]}
      />
      <SelectBlock
        label="Предмет договора"
        value={form.subjectType || ORD_TEMPLATE_SELECT_EMPTY}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            subjectType: value === ORD_TEMPLATE_SELECT_EMPTY ? "" : value,
          }))
        }
        options={[{ value: ORD_TEMPLATE_SELECT_EMPTY, label: "Не указано" }, ...ORD_CONTRACT_SUBJECT_OPTIONS]}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Флаги</p>
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          {ORD_TEMPLATE_FLAG_OPTIONS.map((flag) => (
            <label key={flag.value} className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
              <input
                type="checkbox"
                className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                checked={form.flags.includes(flag.value)}
                onChange={() => toggleFlag(flag.value)}
              />
              <span>{flag.label}</span>
            </label>
          ))}
        </div>
      </div>

      {showActiveToggle ? (
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3 text-sm leading-snug">
          <input
            type="checkbox"
            className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            checked={form.isActive}
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
          />
          <span>
            <span className="block font-medium text-foreground">Автовыпуск включён</span>
            <span className="block text-muted-foreground">
              Если выключено, правило сохранится, но новые договоры выпускаться не будут.
            </span>
          </span>
        </label>
      ) : null}
    </div>
  );
}

function SelectBlock({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function InputBlock({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <InputField
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  );
}
