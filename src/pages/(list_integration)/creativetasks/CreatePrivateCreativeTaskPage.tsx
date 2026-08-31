import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Gift,
  HelpCircle,
  Plus,
  Users,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  CheckBox,
  Input,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@senler/ui";
import { toast } from "sonner";
import type {
  CreatePrivateCreativeTaskRequestDto,
  CreatePrivateCreativeTaskRequestDtoAllowedFormatsItem,
} from "@/api/generated/model";
import { CreatePrivateCreativeTaskRequestDtoTargetPlatform } from "@/api/generated/model";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useAddToCreativeTaskWhitelist } from "@/hooks/creativetasks/useAddToCreativeTaskWhitelist";
import { useCreatePrivateCreativeTask } from "@/hooks/creativetasks/useCreatePrivateCreativeTask";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useSprints } from "@/hooks/sprints/useSprints";
import { OrdContractTemplateSelect } from "../ord/components/OrdContractTemplateSelect";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { OrdKktuPicker } from "./components/OrdKktuPicker";
import { OrdRoomFilesPicker } from "./components/OrdRoomFilesPicker";
import {
  parseMultilineList,
  parseRewardBalls,
  type CreativeTaskFormat,
} from "./utils/creativetaskUtils";

type TaskPlatform = CreatePrivateCreativeTaskRequestDto["targetPlatform"];

interface TaskFormState {
  sprintId: string;
  title: string;
  description: string;
  ordKktus: string[];
  ordContractTemplateId: string;
  targetUrls: string[];
  allowAmbassadorTargetUrl: boolean;
  allowedFormats: CreativeTaskFormat[];
  targetPlatform: TaskPlatform;
  defaultMediaIds: string[];
  allowAmbassadorMedia: boolean;
  defaultTexts: string[];
  allowAmbassadorText: boolean;
  restrictions: string;
  criteria: string[];
  requireMaterialsReview: boolean;
  requirePublicationReview: boolean;
  rewardInRubs: string;
  selectedAmbassadorIds: string[];
}

interface TaskCreationProgress {
  taskId: string;
  assignedAmbassadorIds: string[];
}

const FORMAT_OPTIONS: { value: CreativeTaskFormat; label: string }[] = [
  { value: "POST", label: "Пост" },
  { value: "VIDEO", label: "Видео" },
];

const PLATFORM_OPTIONS: { value: TaskPlatform; label: string }[] = [
  { value: CreatePrivateCreativeTaskRequestDtoTargetPlatform.VK_GROUP, label: "VK — сообщество" },
  { value: CreatePrivateCreativeTaskRequestDtoTargetPlatform.VK_USER, label: "VK — страница" },
  { value: CreatePrivateCreativeTaskRequestDtoTargetPlatform.YOUTUBE_CHANNEL, label: "YouTube" },
  { value: CreatePrivateCreativeTaskRequestDtoTargetPlatform.RUTUBE_CHANNEL, label: "Rutube" },
];

function emptyForm(sprintId: string): TaskFormState {
  return {
    sprintId,
    title: "",
    description: "",
    ordKktus: [],
    ordContractTemplateId: "",
    targetUrls: [""],
    allowAmbassadorTargetUrl: true,
    allowedFormats: ["POST"],
    targetPlatform: CreatePrivateCreativeTaskRequestDtoTargetPlatform.VK_GROUP,
    defaultMediaIds: [],
    allowAmbassadorMedia: true,
    defaultTexts: [""],
    allowAmbassadorText: true,
    restrictions: "",
    criteria: [""],
    requireMaterialsReview: true,
    requirePublicationReview: true,
    rewardInRubs: "0",
    selectedAmbassadorIds: [],
  };
}

function readCreationProgress(key: string): TaskCreationProgress | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<TaskCreationProgress>;
    if (!parsed.taskId || !Array.isArray(parsed.assignedAmbassadorIds)) return null;

    return {
      taskId: parsed.taskId,
      assignedAmbassadorIds: parsed.assignedAmbassadorIds,
    };
  } catch {
    return null;
  }
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[248px_minmax(0,1fr)]">
      <div className="space-y-1">
        <p className="text-[13px] font-medium leading-4 text-foreground">{label}</p>
        {hint ? (
          <p className="text-[13px] font-medium leading-4 text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function RequestFromPerformer({
  checked,
  onCheckedChange,
  title,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium leading-4">
      <CheckBox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={title}
      />
      <span className="inline-flex items-center gap-1" title={title}>
        Запросить у исполнителя
        <HelpCircle className="size-4 text-muted-foreground" aria-hidden />
      </span>
    </label>
  );
}

function WizardStep({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: "active" | "done" | "idle";
}) {
  return (
    <div className="flex items-center gap-1.5" aria-current={state === "active" ? "step" : undefined}>
      <span
        className={[
          "flex size-6 items-center justify-center rounded-full text-[13px] font-medium",
          state === "active"
            ? "bg-[#2563eb] text-white"
            : state === "done"
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {state === "done" ? <Check className="size-4" aria-hidden /> : number}
      </span>
      <span className="text-[13px] font-medium leading-4">{label}</span>
    </div>
  );
}

export default function CreatePrivateCreativeTaskPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSprintId = searchParams.get("sprintId") ?? "";
  const draftKey = `private-creative-task-draft:${slug ?? ""}`;
  const progressKey = `${draftKey}:creation-progress`;
  const [creationProgress, setCreationProgress] = useState<TaskCreationProgress | null>(() =>
    readCreationProgress(progressKey)
  );
  const [step, setStep] = useState<1 | 2>(() => (creationProgress ? 2 : 1));
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [performerPickerOpen, setPerformerPickerOpen] = useState(false);
  const [performerSearch, setPerformerSearch] = useState("");
  const [form, setForm] = useState<TaskFormState>(() => {
    try {
      const draft = localStorage.getItem(draftKey);
      if (!draft) return emptyForm(initialSprintId);
      const parsed = JSON.parse(draft) as Partial<TaskFormState>;
      return {
        ...emptyForm(initialSprintId),
        ...parsed,
        sprintId: initialSprintId || parsed.sprintId || "",
      };
    } catch {
      return emptyForm(initialSprintId);
    }
  });

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
  } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const { sprints } = useSprints({ page: 1, size: 100 }, slug ?? "");
  const { ambassadors, isLoading: isLoadingAmbassadors } = useAmbassadors({
    page: 1,
    size: 100,
    roomIds: roomId ? [roomId] : undefined,
  });
  const {
    createPrivateCreativeTaskAsync,
    isPending,
    generalError,
    validationErrors,
  } = useCreatePrivateCreativeTask();
  const { addToWhitelistAsync } = useAddToCreativeTaskWhitelist();

  const activeSprints = sprints.filter((sprint) => sprint.status === "active");
  const selectedSprint = sprints.find((sprint) => sprint.id === form.sprintId);
  const deadline = selectedSprint?.ignoreEndDate ? "" : selectedSprint?.endDate?.slice(0, 10) ?? "";
  const selectedAmbassadors = ambassadors.filter((ambassador) =>
    form.selectedAmbassadorIds.includes(ambassador.id)
  );
  const filteredAmbassadors = useMemo(() => {
    const search = performerSearch.trim().toLowerCase();
    if (!search) return ambassadors;
    return ambassadors.filter(
      (ambassador) =>
        ambassador.username.toLowerCase().includes(search) ||
        ambassador.promoCode?.toLowerCase().includes(search)
    );
  }, [ambassadors, performerSearch]);

  const updateListItem = (
    key: "targetUrls" | "defaultTexts" | "criteria",
    index: number,
    value: string
  ) => {
    setForm((current) => {
      const items = [...current[key]];
      items[index] = value;
      return { ...current, [key]: items };
    });
  };

  const toggleFormat = (format: CreativeTaskFormat) => {
    setForm((current) => ({
      ...current,
      allowedFormats: current.allowedFormats.includes(format)
        ? current.allowedFormats.filter((item) => item !== format)
        : [...current.allowedFormats, format],
    }));
  };

  const validateDetails = () => {
    const errors: string[] = [];
    if (!form.sprintId) errors.push("Выберите спринт");
    if (form.title.trim().length < 3) {
      errors.push("Укажите название задания (минимум 3 символа)");
    }
    if (!form.ordContractTemplateId) errors.push("Выберите шаблон ОРД-договора");
    if (form.allowedFormats.length === 0) {
      errors.push("Выберите хотя бы один формат публикации");
    }
    if (!form.allowAmbassadorTargetUrl && form.targetUrls.every((url) => !url.trim())) {
      errors.push("Добавьте целевую ссылку или запросите её у исполнителя");
    }
    if (!form.allowAmbassadorText && form.defaultTexts.every((text) => !text.trim())) {
      errors.push("Добавьте текст или запросите его у исполнителя");
    }
    if (!form.allowAmbassadorMedia && form.defaultMediaIds.length === 0) {
      errors.push("Выберите файлы или запросите их у исполнителя");
    }
    return errors;
  };

  const validateSettings = () => {
    const reward = Number(form.rewardInRubs);
    if (!form.rewardInRubs.trim() || !Number.isFinite(reward) || reward < 0) {
      return ["Награда должна быть числом не меньше 0"];
    }
    return [];
  };

  const saveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify(form));
    toast.success("Черновик сохранён в этом браузере");
  };

  const handleContinue = () => {
    const errors = validateDetails();
    setClientErrors(errors);
    setSubmitError("");
    if (errors.length === 0) setStep(2);
  };

  const handleLaunch = async () => {
    const detailErrors = validateDetails();
    const errors = [...detailErrors, ...validateSettings()];
    setClientErrors(errors);
    setSubmitError("");
    if (errors.length > 0) {
      if (detailErrors.length > 0) setStep(1);
      return;
    }
    if (!roomId) {
      setSubmitError("Не удалось определить компанию для задания");
      return;
    }

    const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);
    const payload: CreatePrivateCreativeTaskRequestDto = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      roomId,
      sprintId: form.sprintId,
      isWhitelistEnabled: form.selectedAmbassadorIds.length > 0,
      criteria: clean(form.criteria),
      restrictions: parseMultilineList(form.restrictions),
      allowedFormats:
        form.allowedFormats as CreatePrivateCreativeTaskRequestDtoAllowedFormatsItem[],
      targetPlatform: form.targetPlatform,
      rewardInRubs: parseRewardBalls(form.rewardInRubs),
      ordKktus: form.ordKktus,
      allowAmbassadorMedia: form.allowAmbassadorMedia,
      allowAmbassadorText: form.allowAmbassadorText,
      allowAmbassadorTargetUrl: form.allowAmbassadorTargetUrl,
      publicationsCount: 1,
      requireMaterialsReview: form.requireMaterialsReview,
      requirePublicationReview: form.requirePublicationReview,
      ordContractTemplateId: form.ordContractTemplateId,
      defaultMediaIds: form.defaultMediaIds,
      defaultTexts: clean(form.defaultTexts),
      defaultTargetUrls: clean(form.targetUrls),
    };

    setIsSubmitting(true);
    try {
      localStorage.setItem(draftKey, JSON.stringify(form));
      let progress = creationProgress;
      if (!progress) {
        const task = await createPrivateCreativeTaskAsync(payload);
        progress = { taskId: task.id, assignedAmbassadorIds: [] };
        setCreationProgress(progress);
        localStorage.setItem(progressKey, JSON.stringify(progress));
      }

      const assignedIds = new Set(progress.assignedAmbassadorIds);
      const pendingIds = form.selectedAmbassadorIds.filter((id) => !assignedIds.has(id));
      const results = await Promise.allSettled(
        pendingIds.map((ambassadorId) =>
          addToWhitelistAsync({
            taskId: progress.taskId,
            data: { ambassadorId },
          })
        )
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") assignedIds.add(pendingIds[index]);
      });

      const updatedProgress = {
        taskId: progress.taskId,
        assignedAmbassadorIds: Array.from(assignedIds),
      };
      setCreationProgress(updatedProgress);
      localStorage.setItem(progressKey, JSON.stringify(updatedProgress));

      const failedCount = results.filter((result) => result.status === "rejected").length;
      if (failedCount > 0) {
        setSubmitError(
          `Задание создано, но не удалось добавить исполнителей: ${failedCount}. Повторите назначение — новое задание создано не будет.`
        );
        return;
      }

      localStorage.removeItem(draftKey);
      localStorage.removeItem(progressKey);
      setCreationProgress(null);
      navigate(`/rooms/${slug ?? ""}/creativetasks/private`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Не удалось запустить задание. Попробуйте снова."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <CreativeTasksErrorState
        errorMessage={(roomError as Error | null)?.message ?? "Компания не найдена"}
      />
    );
  }

  const serverValidationMessages = Object.values(validationErrors).flat();
  const errorMessages = Array.from(
    new Set([
      ...clientErrors,
      ...(submitError ? [submitError] : []),
      ...(generalError ? [generalError] : []),
      ...serverValidationMessages,
    ])
  );
  const rewardHasError =
    clientErrors.includes("Награда должна быть числом не меньше 0") ||
    Boolean(validationErrors.rewardInRubs?.length);

  return (
    <div className="-m-4 min-h-dvh w-[calc(100%+2rem)] bg-white md:-m-6 md:w-[calc(100%+3rem)]">
      <header className="sticky top-0 z-10 border-b border-border bg-background px-4 py-2.5">
        <div className="mx-auto flex w-full max-w-[700px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <WizardStep number={1} label="Задание" state={step === 1 ? "active" : "done"} />
            <span className="h-px w-4 bg-border" aria-hidden />
            <WizardStep number={2} label="Настройки" state={step === 2 ? "active" : "idle"} />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[13px] shadow-none"
            onClick={saveDraft}
            disabled={Boolean(creationProgress) || isSubmitting}
          >
            Сохранить черновик
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[700px] px-4 py-5">
        {errorMessages.length > 0 ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-4">
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        {creationProgress && !submitError ? (
          <Alert className="mb-4">
            <AlertDescription>
              Задание уже создано. Параметры задания зафиксированы; завершите выбор и назначение
              исполнителей.
            </AlertDescription>
          </Alert>
        ) : null}

        {step === 1 ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {!initialSprintId ? (
              <FieldRow label="Спринт" hint="Задание будет доступно в выбранном спринте">
                <Select
                  value={form.sprintId || undefined}
                  onValueChange={(sprintId) => setForm((current) => ({ ...current, sprintId }))}
                >
                  <SelectTrigger className="h-10 text-[13px] shadow-none" aria-label="Спринт">
                    <SelectValue placeholder="Выберите спринт" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
            ) : null}

            <FieldRow label="Код ККТУ" hint="Выберите тематику публикации">
              <OrdKktuPicker
                selectedCodes={form.ordKktus}
                onChange={(ordKktus) => setForm((current) => ({ ...current, ordKktus }))}
              />
            </FieldRow>

            <div className="[&:not(:has(.ord-contract-template-select))]:hidden">
              <FieldRow label="Шаблон ОРД-договора" hint="Обязателен для запуска задания">
                <OrdContractTemplateSelect
                  roomId={roomId}
                  roomSlug={slug ?? ""}
                  value={form.ordContractTemplateId}
                  onChange={(ordContractTemplateId) =>
                    setForm((current) => ({ ...current, ordContractTemplateId }))
                  }
                  error={validationErrors.ordContractTemplateId?.[0]}
                  required
                  autoSelectSingle
                />
              </FieldRow>
            </div>

            <FieldRow label="Название">
              <Input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="h-10 text-[13px] shadow-none"
                aria-label="Название задания"
              />
            </FieldRow>

            <FieldRow label="Что нужно сделать" hint="Опишите суть задания">
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-[72px] text-[13px] shadow-none"
                aria-label="Что нужно сделать"
              />
            </FieldRow>

            <FieldRow label="Целевая ссылка для перехода">
              <div className="space-y-3">
                {form.targetUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={url}
                      onChange={(event) => updateListItem("targetUrls", index, event.target.value)}
                      placeholder="https://"
                      className="h-10 flex-1 text-[13px] shadow-none"
                      aria-label={`Целевая ссылка ${index + 1}`}
                    />
                    {form.targetUrls.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setForm((current) => ({
                          ...current,
                          targetUrls: current.targetUrls.filter((_, itemIndex) => itemIndex !== index),
                        }))}
                        aria-label="Удалить ссылку"
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[13px] shadow-none"
                  onClick={() => setForm((current) => ({ ...current, targetUrls: [...current.targetUrls, ""] }))}
                >
                  <Plus className="size-4" aria-hidden /> Добавить
                </Button>
                <RequestFromPerformer
                  checked={form.allowAmbassadorTargetUrl}
                  onCheckedChange={(allowAmbassadorTargetUrl) =>
                    setForm((current) => ({ ...current, allowAmbassadorTargetUrl }))
                  }
                  title="Исполнитель укажет свою ссылку перехода"
                />
              </div>
            </FieldRow>

            <FieldRow label="Формат публикации">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_OPTIONS.map((option) => {
                    const active = form.allowedFormats.includes(option.value);
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        variant={active ? "default" : "outline"}
                        size="sm"
                        className={active ? "h-7 bg-[#2563eb] px-2 text-[13px]" : "h-7 px-2 text-[13px] shadow-none"}
                        onClick={() => toggleFormat(option.value)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
                <Select
                  value={form.targetPlatform}
                  onValueChange={(targetPlatform) => setForm((current) => ({
                    ...current,
                    targetPlatform: targetPlatform as TaskPlatform,
                  }))}
                >
                  <SelectTrigger className="h-10 text-[13px] shadow-none" aria-label="Площадка публикации">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FieldRow>

            <FieldRow label="Медиаматериалы">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[13px] font-medium">Файлы</p>
                  <OrdRoomFilesPicker
                    roomId={roomId}
                    roomSlug={slug ?? ""}
                    selectedIds={form.defaultMediaIds}
                    onChange={(defaultMediaIds) => setForm((current) => ({ ...current, defaultMediaIds }))}
                  />
                  <RequestFromPerformer
                    checked={form.allowAmbassadorMedia}
                    onCheckedChange={(allowAmbassadorMedia) => setForm((current) => ({ ...current, allowAmbassadorMedia }))}
                    title="Исполнитель приложит свои файлы"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[13px] font-medium">Текст</p>
                  {form.defaultTexts.map((text, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Textarea
                        value={text}
                        onChange={(event) => updateListItem("defaultTexts", index, event.target.value)}
                        className="min-h-[72px] flex-1 text-[13px] shadow-none"
                        aria-label={`Текст ${index + 1}`}
                      />
                      {form.defaultTexts.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setForm((current) => ({
                            ...current,
                            defaultTexts: current.defaultTexts.filter((_, itemIndex) => itemIndex !== index),
                          }))}
                          aria-label="Удалить текст"
                        >
                          <X className="size-4" aria-hidden />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[13px] shadow-none"
                    onClick={() => setForm((current) => ({ ...current, defaultTexts: [...current.defaultTexts, ""] }))}
                  >
                    <Plus className="size-4" aria-hidden /> Добавить
                  </Button>
                  <RequestFromPerformer
                    checked={form.allowAmbassadorText}
                    onCheckedChange={(allowAmbassadorText) => setForm((current) => ({ ...current, allowAmbassadorText }))}
                    title="Исполнитель напишет свой текст"
                  />
                </div>
              </div>
            </FieldRow>

            <FieldRow label="Что запрещено" hint="Расскажите, что нельзя делать в рамках задания">
              <Textarea
                value={form.restrictions}
                onChange={(event) => setForm((current) => ({ ...current, restrictions: event.target.value }))}
                className="min-h-[72px] text-[13px] shadow-none"
                aria-label="Что запрещено"
              />
            </FieldRow>

            <FieldRow label="Критерии оценки" hint="Укажите требования, которые необходимо соблюдать">
              <div className="space-y-3">
                {form.criteria.map((criterion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={criterion}
                      onChange={(event) => updateListItem("criteria", index, event.target.value)}
                      placeholder={`${index + 1}.`}
                      className="h-10 flex-1 text-[13px] shadow-none"
                      aria-label={`Критерий ${index + 1}`}
                    />
                    {form.criteria.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setForm((current) => ({
                          ...current,
                          criteria: current.criteria.filter((_, itemIndex) => itemIndex !== index),
                        }))}
                        aria-label="Удалить критерий"
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[13px] shadow-none"
                  onClick={() => setForm((current) => ({ ...current, criteria: [...current.criteria, ""] }))}
                >
                  <Plus className="size-4" aria-hidden /> Добавить
                </Button>
              </div>
            </FieldRow>

            <FieldRow label="Модерация" hint="Выберите этапы проверки работы">
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 text-[13px] font-medium">
                  <Switch
                    checked={form.requireMaterialsReview}
                    onCheckedChange={(requireMaterialsReview) => setForm((current) => ({ ...current, requireMaterialsReview }))}
                    aria-label="Проверять перед публикацией"
                  />
                  Перед публикацией
                </label>
                <label className="flex items-center gap-2.5 text-[13px] font-medium">
                  <Switch
                    checked={form.requirePublicationReview}
                    onCheckedChange={(requirePublicationReview) => setForm((current) => ({ ...current, requirePublicationReview }))}
                    aria-label="Проверять после публикации"
                  />
                  После публикации
                </label>
              </div>
            </FieldRow>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <FieldRow label="Дедлайн" hint="Совпадает с датой окончания выбранного спринта">
              <Input
                type="date"
                value={deadline}
                readOnly
                disabled={!deadline}
                className="h-10 text-[13px] shadow-none"
                aria-label="Дедлайн задания"
              />
            </FieldRow>

            <FieldRow label="Исполнители" hint="Выберите участников индивидуального задания">
              <div className="space-y-3">
                {selectedAmbassadors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAmbassadors.map((ambassador) => (
                      <span key={ambassador.id} className="inline-flex h-8 items-center gap-2 rounded-full border border-border px-2 text-[13px] font-medium">
                        {ambassador.avatarUrl ? (
                          <img src={ambassador.avatarUrl} alt="" className="size-5 rounded-full object-cover" />
                        ) : (
                          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px]">
                            {ambassador.username.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        {ambassador.username}
                        <button
                          type="button"
                          disabled={creationProgress?.assignedAmbassadorIds.includes(ambassador.id)}
                          onClick={() => setForm((current) => ({
                            ...current,
                            selectedAmbassadorIds: current.selectedAmbassadorIds.filter((id) => id !== ambassador.id),
                          }))}
                          aria-label={`Убрать ${ambassador.username}`}
                        >
                          <X className="size-3.5 text-muted-foreground" aria-hidden />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[13px] shadow-none"
                  onClick={() => setPerformerPickerOpen((open) => !open)}
                  aria-expanded={performerPickerOpen}
                  aria-controls="private-task-performer-picker"
                >
                  <Plus className="size-4" aria-hidden /> Добавить
                </Button>
                {performerPickerOpen ? (
                  <div
                    id="private-task-performer-picker"
                    className="space-y-2 rounded-lg border border-border p-2"
                  >
                    <Input
                      value={performerSearch}
                      onChange={(event) => setPerformerSearch(event.target.value)}
                      placeholder="Поиск исполнителя"
                      className="h-9 text-[13px] shadow-none"
                      aria-label="Поиск исполнителя"
                    />
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {isLoadingAmbassadors ? (
                        <p className="p-2 text-[13px] text-muted-foreground">Загрузка…</p>
                      ) : filteredAmbassadors.length === 0 ? (
                        <p className="p-2 text-[13px] text-muted-foreground">Ничего не найдено</p>
                      ) : filteredAmbassadors.map((ambassador) => {
                        const selected = form.selectedAmbassadorIds.includes(ambassador.id);
                        return (
                          <label key={ambassador.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-muted">
                            <CheckBox
                              checked={selected}
                              disabled={creationProgress?.assignedAmbassadorIds.includes(ambassador.id)}
                              onCheckedChange={() => setForm((current) => ({
                                ...current,
                                selectedAmbassadorIds: selected
                                  ? current.selectedAmbassadorIds.filter((id) => id !== ambassador.id)
                                  : [...current.selectedAmbassadorIds, ambassador.id],
                              }))}
                              aria-label={`Выбрать ${ambassador.username}`}
                            />
                            <Users className="size-4 text-muted-foreground" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">{ambassador.username}</span>
                            {ambassador.promoCode ? <span className="text-muted-foreground">{ambassador.promoCode}</span> : null}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </FieldRow>

            <FieldRow label="Награды для каждого" hint="Начисляются каждому исполнителю после проверки">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Gift className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">Рубли</p>
                  <p className="text-xs text-muted-foreground">Сумма награды</p>
                </div>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={form.rewardInRubs}
                  onChange={(event) => setForm((current) => ({ ...current, rewardInRubs: event.target.value }))}
                  className="h-9 w-28 text-right text-[13px] shadow-none"
                  aria-label="Награда в рублях"
                  aria-invalid={rewardHasError}
                  aria-describedby={rewardHasError ? "private-task-reward-error" : undefined}
                  disabled={Boolean(creationProgress)}
                />
              </div>
              {rewardHasError ? (
                <p id="private-task-reward-error" className="mt-1 text-xs text-destructive">
                  {validationErrors.rewardInRubs?.[0] ?? "Награда должна быть числом не меньше 0"}
                </p>
              ) : null}
            </FieldRow>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          {step === 1 ? (
            <Button type="button" variant="outline" size="sm" className="h-7 text-[13px] shadow-none" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4" aria-hidden /> Назад
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[13px] shadow-none"
              onClick={() => setStep(1)}
              disabled={Boolean(creationProgress) || isSubmitting}
            >
              <ArrowLeft className="size-4" aria-hidden /> Назад
            </Button>
          )}
          {step === 1 ? (
            <Button type="button" size="sm" className="h-7 bg-[#2563eb] px-2 text-[13px] hover:bg-[#2563eb]/90" onClick={handleContinue}>
              Продолжить
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-7 bg-[#2563eb] px-2 text-[13px] hover:bg-[#2563eb]/90"
              onClick={() => void handleLaunch()}
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending
                ? "Запуск…"
                : creationProgress
                  ? "Повторить назначение"
                  : "Запустить задание"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
