import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import {
  getOrdContractTemplatesControllerGetTemplateByIdQueryKey,
  getOrdContractTemplatesControllerGetTemplatesQueryKey,
  useOrdContractTemplatesControllerCreateTemplate,
  useOrdContractTemplatesControllerGetTemplateById,
  useOrdContractTemplatesControllerGetTemplates,
  useOrdContractTemplatesControllerUpdateTemplate,
} from "@/api/generated/ord-contract-templates/ord-contract-templates";
import type {
  CreateOrdContractTemplateRequestDto,
  CreateOrdContractTemplateRequestDtoDateEndStrategy,
  CreateOrdContractTemplateRequestDtoDateStrategy,
  CreateOrdContractTemplateRequestDtoFlagsItem,
  CreateOrdContractTemplateRequestDtoType,
  OrdContractTemplateItemDto,
  UpdateOrdContractTemplateRequestDto,
} from "@/api/generated/model";
import {
  ORD_CONTRACT_ACTION_OPTIONS,
  ORD_CONTRACT_SUBJECT_OPTIONS,
  ORD_CONTRACT_TYPE_OPTIONS,
  ORD_COPY,
} from "./ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "./ord.utils";

const SELECT_EMPTY = "__empty__";
const DATE_STRATEGY_OPTIONS: { value: CreateOrdContractTemplateRequestDtoDateStrategy; label: string }[] = [
  { value: "today", label: "Дата создания договора" },
  { value: "fixed", label: "Фиксированная дата" },
];
const DATE_END_STRATEGY_OPTIONS: { value: CreateOrdContractTemplateRequestDtoDateEndStrategy; label: string }[] = [
  { value: "none", label: "Без даты окончания" },
  { value: "fixed", label: "Фиксированная дата" },
  { value: "offsetDays", label: "Через N дней" },
];
const FLAG_OPTIONS: { value: CreateOrdContractTemplateRequestDtoFlagsItem; label: string }[] = [
  { value: "vat_included", label: "НДС включён" },
  { value: "contractor_is_creatives_reporter", label: "Исполнитель — репортёр креативов" },
  { value: "agent_acting_for_publisher", label: "Агент действует для издателя" },
  { value: "is_charge_paid_by_agent", label: "Вознаграждение платит агент" },
];

type TemplateFormState = {
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
};

const emptyForm = (): TemplateFormState => ({
  name: "",
  type: "service",
  dateStrategy: "today",
  fixedDate: "",
  dateEndStrategy: "none",
  fixedDateEnd: "",
  dateEndOffsetDays: "",
  fixedAmount: "",
  autoGetCid: false,
  actionType: "",
  subjectType: "",
  flags: [],
});

const dateInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
const isoDate = (value: string) => (value ? new Date(`${value}T12:00:00`).toISOString() : undefined);
const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const optionLabel = (options: { value: string; label: string }[], value: string | null | undefined) =>
  options.find((option) => option.value === value)?.label ?? value ?? "—";

const formFromTemplate = (template: OrdContractTemplateItemDto): TemplateFormState => ({
  name: template.name,
  type: template.type,
  dateStrategy: template.dateStrategy,
  fixedDate: dateInput(template.fixedDate),
  dateEndStrategy: template.dateEndStrategy,
  fixedDateEnd: dateInput(template.fixedDateEnd),
  dateEndOffsetDays: template.dateEndOffsetDays ? String(template.dateEndOffsetDays) : "",
  fixedAmount: template.fixedAmount ?? "",
  autoGetCid: template.autoGetCid,
  actionType: template.actionType ?? "",
  subjectType: template.subjectType ?? "",
  flags: template.flags ?? [],
});

const buildPayload = (form: TemplateFormState): CreateOrdContractTemplateRequestDto => {
  const payload: CreateOrdContractTemplateRequestDto = {
    name: form.name.trim(),
    type: form.type,
    dateStrategy: form.dateStrategy,
    dateEndStrategy: form.dateEndStrategy,
    autoGetCid: form.autoGetCid,
  };
  const fixedDate = isoDate(form.fixedDate);
  const fixedDateEnd = isoDate(form.fixedDateEnd);
  const offsetDays = Number(form.dateEndOffsetDays);

  if (form.dateStrategy === "fixed" && fixedDate) payload.fixedDate = fixedDate;
  if (form.dateEndStrategy === "fixed" && fixedDateEnd) payload.fixedDateEnd = fixedDateEnd;
  if (form.dateEndStrategy === "offsetDays" && Number.isFinite(offsetDays) && offsetDays > 0) {
    payload.dateEndOffsetDays = offsetDays;
  }
  if (form.fixedAmount.trim()) payload.fixedAmount = form.fixedAmount.trim();
  if (form.actionType) payload.actionType = form.actionType as CreateOrdContractTemplateRequestDto["actionType"];
  if (form.subjectType) payload.subjectType = form.subjectType as CreateOrdContractTemplateRequestDto["subjectType"];
  if (form.flags.length) payload.flags = form.flags;

  return payload;
};

export default function OrdTemplatesPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { room, isLoading: isRoomLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormState>(() => emptyForm());
  const templatesQuery = useOrdContractTemplatesControllerGetTemplates(
    roomId,
    { page, size: 10 },
    { query: { enabled: !!roomId } }
  );
  const detailQuery = useOrdContractTemplatesControllerGetTemplateById(
    roomId,
    selectedTemplateId ?? "",
    { query: { enabled: sheetOpen && !!roomId && !!selectedTemplateId } }
  );
  const createTemplate = useOrdContractTemplatesControllerCreateTemplate();
  const updateTemplate = useOrdContractTemplatesControllerUpdateTemplate();
  const templates = templatesQuery.data?.items ?? [];
  const totalPages = templatesQuery.data?.totalPages ?? 0;
  const hasOrdProfile = !!room?.ordPerson;
  const isEditMode = !!selectedTemplateId;
  const mutationError = createTemplate.error ?? updateTemplate.error;

  useEffect(() => {
    if (detailQuery.data && selectedTemplateId) {
      setForm(formFromTemplate(detailQuery.data));
    }
  }, [detailQuery.data, selectedTemplateId]);

  const invalidateTemplates = (templateId?: string) => {
    queryClient.invalidateQueries({ queryKey: getOrdContractTemplatesControllerGetTemplatesQueryKey(roomId) });
    if (templateId) {
      queryClient.invalidateQueries({
        queryKey: getOrdContractTemplatesControllerGetTemplateByIdQueryKey(roomId, templateId),
      });
    }
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedTemplateId(null);
    setForm(emptyForm());
    createTemplate.reset();
    updateTemplate.reset();
  };

  const openCreateSheet = () => {
    setSelectedTemplateId(null);
    setForm(emptyForm());
    createTemplate.reset();
    updateTemplate.reset();
    setSheetOpen(true);
  };

  const openEditSheet = (template: OrdContractTemplateItemDto) => {
    setSelectedTemplateId(template.id);
    setForm(formFromTemplate(template));
    createTemplate.reset();
    updateTemplate.reset();
    setSheetOpen(true);
  };

  const toggleFlag = (value: CreateOrdContractTemplateRequestDtoFlagsItem) => {
    setForm((prev) => ({
      ...prev,
      flags: prev.flags.includes(value) ? prev.flags.filter((flag) => flag !== value) : [...prev.flags, value],
    }));
  };

  const handleSubmit = () => {
    if (!roomId || !form.name.trim()) return;
    const payload = buildPayload(form);

    if (selectedTemplateId) {
      updateTemplate.mutate(
        { roomId, templateId: selectedTemplateId, data: payload as UpdateOrdContractTemplateRequestDto },
        { onSuccess: () => { invalidateTemplates(selectedTemplateId); closeSheet(); } }
      );
      return;
    }

    createTemplate.mutate(
      { roomId, data: payload },
      { onSuccess: (template) => { invalidateTemplates(template.id); closeSheet(); } }
    );
  };

  if (isRoomLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{ORD_COPY.templatesTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Параметры будущих ORD-договоров для автогенерации.</p>
        </div>
        <Button type="button" size="lg" onClick={openCreateSheet} disabled={!hasOrdProfile}>
          {ORD_COPY.createTemplate}
        </Button>
      </div>

      {!hasOrdProfile ? (
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
          <PageLoader label="Загрузка шаблонов…" />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">{ORD_COPY.noTemplates}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Название</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Тип</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Дата договора</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Окончание</th>
                  <th className="px-3 py-2.5 text-right font-medium text-foreground">Сумма</th>
                  <th className="px-3 py-2.5 text-right font-medium text-foreground" />
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5 align-top">
                      <span className="font-medium text-foreground">{template.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        CID: {template.autoGetCid ? "автоматически" : "вручную"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top text-foreground">{ordContractTypeLabel(template.type)}</td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="text-foreground">{optionLabel(DATE_STRATEGY_OPTIONS, template.dateStrategy)}</span>
                      {template.fixedDate ? <span className="block text-xs text-muted-foreground">{formatOrdDate(template.fixedDate)}</span> : null}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="text-foreground">{optionLabel(DATE_END_STRATEGY_OPTIONS, template.dateEndStrategy)}</span>
                      {template.fixedDateEnd || template.dateEndOffsetDays ? (
                        <span className="block text-xs text-muted-foreground">
                          {template.fixedDateEnd ? formatOrdDate(template.fixedDateEnd) : `+${template.dateEndOffsetDays} дн.`}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-right align-top text-foreground">{template.fixedAmount ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditSheet(template)}>
                        Изменить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Назад
              </Button>
              <span className="min-w-[4.5rem] text-center text-sm text-muted-foreground tabular-nums">{page} / {totalPages}</span>
              <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Вперёд
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Sheet open={sheetOpen} onOpenChange={(next) => (next ? setSheetOpen(true) : closeSheet())}>
        <SheetContent side="bottom" showCloseButton={false} className="flex !max-h-[min(100dvh,42rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg">
          <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
            <Button type="button" variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={closeSheet} aria-label="Закрыть">
              <X className="size-5" />
            </Button>
            <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
              {isEditMode ? ORD_COPY.editTemplate : ORD_COPY.createTemplate}
            </SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {mutationError ? <Alert variant="destructive"><AlertDescription>{errorMessage(mutationError, "Не удалось сохранить шаблон")}</AlertDescription></Alert> : null}
            {detailQuery.isError ? <Alert variant="destructive"><AlertDescription>{errorMessage(detailQuery.error, "Не удалось загрузить шаблон")}</AlertDescription></Alert> : null}
            {isEditMode && detailQuery.isLoading ? (
              <div className="flex justify-center py-8"><PageLoader label="Загрузка шаблона…" /></div>
            ) : (
              <TemplateForm form={form} setForm={setForm} toggleFlag={toggleFlag} />
            )}
          </div>
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4">
            <Button type="button" variant="outline" size="lg" onClick={closeSheet}>Отмена</Button>
            <Button type="button" size="lg" onClick={handleSubmit} disabled={!form.name.trim() || createTemplate.isPending || updateTemplate.isPending}>
              {createTemplate.isPending || updateTemplate.isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TemplateForm({
  form,
  setForm,
  toggleFlag,
}: {
  form: TemplateFormState;
  setForm: Dispatch<SetStateAction<TemplateFormState>>;
  toggleFlag: (value: CreateOrdContractTemplateRequestDtoFlagsItem) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Название *</p>
        <InputField value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Например, договор для событий" aria-label="Название шаблона" />
      </div>
      <SelectBlock label="Тип договора" value={form.type} onChange={(value) => setForm((prev) => ({ ...prev, type: value as CreateOrdContractTemplateRequestDtoType }))} options={ORD_CONTRACT_TYPE_OPTIONS} />
      <SelectBlock label="Дата заключения" value={form.dateStrategy} onChange={(value) => setForm((prev) => ({ ...prev, dateStrategy: value as CreateOrdContractTemplateRequestDtoDateStrategy }))} options={DATE_STRATEGY_OPTIONS} />
      {form.dateStrategy === "fixed" ? <InputBlock label="Фиксированная дата заключения" type="date" value={form.fixedDate} onChange={(value) => setForm((prev) => ({ ...prev, fixedDate: value }))} /> : null}
      <SelectBlock label="Дата окончания" value={form.dateEndStrategy} onChange={(value) => setForm((prev) => ({ ...prev, dateEndStrategy: value as CreateOrdContractTemplateRequestDtoDateEndStrategy }))} options={DATE_END_STRATEGY_OPTIONS} />
      {form.dateEndStrategy === "fixed" ? <InputBlock label="Фиксированная дата окончания" type="date" value={form.fixedDateEnd} onChange={(value) => setForm((prev) => ({ ...prev, fixedDateEnd: value }))} /> : null}
      {form.dateEndStrategy === "offsetDays" ? <InputBlock label="Сдвиг в днях" type="number" value={form.dateEndOffsetDays} onChange={(value) => setForm((prev) => ({ ...prev, dateEndOffsetDays: value }))} /> : null}
      <InputBlock label="Сумма" value={form.fixedAmount} onChange={(value) => setForm((prev) => ({ ...prev, fixedAmount: value }))} placeholder="Необязательно" />
      <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3 text-sm leading-snug">
        <input type="checkbox" className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" checked={form.autoGetCid} onChange={(e) => setForm((prev) => ({ ...prev, autoGetCid: e.target.checked }))} />
        <span><span className="block font-medium text-foreground">Автоматически запрашивать CID</span><span className="block text-muted-foreground">Новые договоры будут вставать в очередь на получение CID.</span></span>
      </label>
      <SelectBlock label="Тип действия" value={form.actionType || SELECT_EMPTY} onChange={(value) => setForm((prev) => ({ ...prev, actionType: value === SELECT_EMPTY ? "" : value }))} options={[{ value: SELECT_EMPTY, label: "Не указано" }, ...ORD_CONTRACT_ACTION_OPTIONS]} />
      <SelectBlock label="Предмет договора" value={form.subjectType || SELECT_EMPTY} onChange={(value) => setForm((prev) => ({ ...prev, subjectType: value === SELECT_EMPTY ? "" : value }))} options={[{ value: SELECT_EMPTY, label: "Не указано" }, ...ORD_CONTRACT_SUBJECT_OPTIONS]} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Флаги</p>
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          {FLAG_OPTIONS.map((flag) => (
            <label key={flag.value} className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
              <input type="checkbox" className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" checked={form.flags.includes(flag.value)} onChange={() => toggleFlag(flag.value)} />
              <span>{flag.label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
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
        <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
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
      <InputField type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} />
    </div>
  );
}
