import type {
  CreateOrdContractTemplateRequestDto,
  CreateOrdContractTemplateRequestDtoDateEndStrategy,
  CreateOrdContractTemplateRequestDtoDateStrategy,
  CreateOrdContractTemplateRequestDtoFlagsItem,
  CreateOrdContractTemplateRequestDtoType,
  OrdContractTemplateItemDto,
  OrdIssuanceRuleTemplateDto,
  UpsertOrdIssuanceRuleDto,
} from "@/api/generated/model";

export type OrdTemplateFormState = {
  name: string;
  type: CreateOrdContractTemplateRequestDtoType;
  dateStrategy: CreateOrdContractTemplateRequestDtoDateStrategy;
  fixedDate: string;
  dateEndStrategy: CreateOrdContractTemplateRequestDtoDateEndStrategy;
  fixedDateEnd: string;
  dateEndOffsetDays: string;
  fixedAmount: string;
  autoGetCid: boolean;
  actionType: string;
  subjectType: string;
  flags: CreateOrdContractTemplateRequestDtoFlagsItem[];
  isActive: boolean;
};

export const ORD_TEMPLATE_DATE_STRATEGY_OPTIONS: {
  value: CreateOrdContractTemplateRequestDtoDateStrategy;
  label: string;
}[] = [
  { value: "today", label: "Дата создания договора" },
  { value: "fixed", label: "Фиксированная дата" },
];

export const ORD_TEMPLATE_DATE_END_STRATEGY_OPTIONS: {
  value: CreateOrdContractTemplateRequestDtoDateEndStrategy;
  label: string;
}[] = [
  { value: "none", label: "Без даты окончания" },
  { value: "fixed", label: "Фиксированная дата" },
  { value: "offsetDays", label: "Через N дней" },
];

export const ORD_TEMPLATE_FLAG_OPTIONS: {
  value: CreateOrdContractTemplateRequestDtoFlagsItem;
  label: string;
}[] = [
  { value: "vat_included", label: "НДС включён" },
  { value: "contractor_is_creatives_reporter", label: "Исполнитель — репортёр креативов" },
  { value: "agent_acting_for_publisher", label: "Агент действует для издателя" },
  { value: "is_charge_paid_by_agent", label: "Вознаграждение платит агент" },
];

export const ORD_TEMPLATE_SELECT_EMPTY = "__empty__";

export const emptyOrdTemplateForm = (): OrdTemplateFormState => ({
  name: "",
  type: "service",
  dateStrategy: "today",
  fixedDate: "",
  dateEndStrategy: "none",
  fixedDateEnd: "",
  dateEndOffsetDays: "",
  fixedAmount: "",
  autoGetCid: true,
  actionType: "",
  subjectType: "",
  flags: [],
  isActive: true,
});

export const ordDateInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const isoDate = (value: string) => (value ? new Date(`${value}T12:00:00`).toISOString() : undefined);

type TemplateLike = OrdContractTemplateItemDto | OrdIssuanceRuleTemplateDto;

export const ordTemplateFormFromTemplate = (template: TemplateLike, isActive = true): OrdTemplateFormState => ({
  name: template.name,
  type: template.type,
  dateStrategy: template.dateStrategy,
  fixedDate: ordDateInput(template.fixedDate),
  dateEndStrategy: template.dateEndStrategy,
  fixedDateEnd: ordDateInput(template.fixedDateEnd),
  dateEndOffsetDays: template.dateEndOffsetDays ? String(template.dateEndOffsetDays) : "",
  fixedAmount: template.fixedAmount ?? "",
  autoGetCid: template.autoGetCid,
  actionType: template.actionType ?? "",
  subjectType: template.subjectType ?? "",
  flags: template.flags ?? [],
  isActive,
});

const appendTemplateFields = (
  payload: CreateOrdContractTemplateRequestDto | UpsertOrdIssuanceRuleDto,
  form: OrdTemplateFormState
) => {
  const fixedDate = isoDate(form.fixedDate);
  const fixedDateEnd = isoDate(form.fixedDateEnd);
  const offsetDays = Number(form.dateEndOffsetDays);

  if (form.dateStrategy === "fixed" && fixedDate) payload.fixedDate = fixedDate;
  if (form.dateEndStrategy === "fixed" && fixedDateEnd) payload.fixedDateEnd = fixedDateEnd;
  if (form.dateEndStrategy === "offsetDays" && Number.isFinite(offsetDays) && offsetDays > 0) {
    payload.dateEndOffsetDays = offsetDays;
  }
  if (form.fixedAmount.trim()) payload.fixedAmount = form.fixedAmount.trim();
  if (form.actionType) {
    payload.actionType = form.actionType as NonNullable<UpsertOrdIssuanceRuleDto["actionType"]>;
  }
  if (form.subjectType) {
    payload.subjectType = form.subjectType as NonNullable<UpsertOrdIssuanceRuleDto["subjectType"]>;
  }
  if (form.flags.length) payload.flags = form.flags;
};

export const buildOrdContractTemplatePayload = (
  form: OrdTemplateFormState
): CreateOrdContractTemplateRequestDto => {
  const payload: CreateOrdContractTemplateRequestDto = {
    name: form.name.trim(),
    type: form.type,
    dateStrategy: form.dateStrategy,
    dateEndStrategy: form.dateEndStrategy,
    autoGetCid: form.autoGetCid,
  };

  appendTemplateFields(payload, form);
  return payload;
};

export const buildUpsertOrdIssuanceRulePayload = (form: OrdTemplateFormState): UpsertOrdIssuanceRuleDto => {
  const payload: UpsertOrdIssuanceRuleDto = {
    name: form.name.trim(),
    type: form.type,
    dateStrategy: form.dateStrategy,
    dateEndStrategy: form.dateEndStrategy,
    autoGetCid: form.autoGetCid,
    isActive: form.isActive,
  };

  appendTemplateFields(payload, form);
  return payload;
};
