import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
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
  Switch,
} from "@senler/ui";
import type {
  BasePrivateCreativeTaskDto,
  CreatePrivateCreativeTaskRequestDto,
  CreatePrivateCreativeTaskRequestDtoAllowedFormatsItem,
  UpdatePrivateCreativeTaskRequestDto,
  UpdatePrivateCreativeTaskRequestDtoAllowedFormatsItem,
} from "@/api/generated/model";
import { CreatePrivateCreativeTaskRequestDtoTargetPlatform } from "@/api/generated/model";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useRoomPrivateCreativeTasks } from "@/hooks/creativetasks/useRoomPrivateCreativeTasks";
import { usePrivateCreativeTask } from "@/hooks/creativetasks/usePrivateCreativeTask";
import { useCreatePrivateCreativeTask } from "@/hooks/creativetasks/useCreatePrivateCreativeTask";
import { useUpdatePrivateCreativeTask } from "@/hooks/creativetasks/useUpdatePrivateCreativeTask";
import { usePrivateSubmissions } from "@/hooks/creativetasks/usePrivateSubmissions";
import { useCreativeTaskWhitelist } from "@/hooks/creativetasks/useCreativeTaskWhitelist";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { CreativeTasksEmptyState } from "./components/CreativeTasksEmptyState";
import { CreativesPaginationControls } from "./components/CreativesPaginationControls";
import {
  CREATIVE_TASK_FORMAT_OPTIONS,
  formatMultilineList,
  parseMultilineList,
  parseRewardBalls,
  type CreativeTaskFormat,
} from "./utils/creativetaskUtils";
import { OrdContractTemplateSelect } from "../ord/components/OrdContractTemplateSelect";

const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] || "";
const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  Boolean(fieldErrors[fieldName]?.length);

interface PrivateTaskFormState {
  title: string;
  description: string;
  rewardInRubs: string;
  criteria: string;
  restrictions: string;
  sprintId: string;
  allowedFormats: CreativeTaskFormat[];
  isWhitelistEnabled: boolean;
  isDeleted: boolean;
}

const emptyForm = (): PrivateTaskFormState => ({
  title: "",
  description: "",
  rewardInRubs: "0",
  criteria: "",
  restrictions: "",
  sprintId: "",
  allowedFormats: [],
  isWhitelistEnabled: true,
  isDeleted: false,
});

function formatsPayload(formats: CreativeTaskFormat[]) {
  return formats as CreatePrivateCreativeTaskRequestDtoAllowedFormatsItem[] &
    UpdatePrivateCreativeTaskRequestDtoAllowedFormatsItem[];
}

function PrivateTaskFields({
  form,
  setForm,
  validationErrors,
  includeDeleted,
  sprintOptions = [],
  requireSprint = false,
}: {
  form: PrivateTaskFormState;
  setForm: (next: PrivateTaskFormState) => void;
  validationErrors: Record<string, string[]>;
  includeDeleted?: boolean;
  sprintOptions?: { id: string; name: string }[];
  requireSprint?: boolean;
}) {
  const update = <K extends keyof PrivateTaskFormState>(key: K, value: PrivateTaskFormState[K]) => {
    setForm({ ...form, [key]: value });
  };

  const toggleFormat = (format: CreativeTaskFormat) => {
    update(
      "allowedFormats",
      form.allowedFormats.includes(format)
        ? form.allowedFormats.filter((item) => item !== format)
        : [...form.allowedFormats, format]
    );
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Название *</p>
        <InputField
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          error={hasFieldError(validationErrors, "title")}
          helperText={getFirstFieldError(validationErrors, "title") || undefined}
          aria-label="Название"
        />
      </div>
      {requireSprint || sprintOptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Спринт{requireSprint ? " *" : ""}
          </p>
          <Select
            value={form.sprintId || undefined}
            onValueChange={(value) => update("sprintId", value)}
          >
            <SelectTrigger aria-label="Спринт">
              <SelectValue placeholder="Выберите спринт" />
            </SelectTrigger>
            <SelectContent>
              {sprintOptions.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFieldError(validationErrors, "sprintId") ? (
            <p className="text-sm text-destructive">
              {getFirstFieldError(validationErrors, "sprintId")}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Описание</p>
        <textarea
          className={TEXTAREA_CLASS}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          aria-label="Описание"
        />
        {hasFieldError(validationErrors, "description") ? (
          <p className="text-sm text-destructive">{getFirstFieldError(validationErrors, "description")}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Награда, ₽</p>
        <InputField
          type="number"
          min={0}
          step={1}
          value={form.rewardInRubs}
          onChange={(e) => update("rewardInRubs", e.target.value)}
          error={hasFieldError(validationErrors, "rewardInRubs")}
          helperText={getFirstFieldError(validationErrors, "rewardInRubs") || undefined}
          aria-label="Награда в рублях"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Разрешённые форматы</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {CREATIVE_TASK_FORMAT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                checked={form.allowedFormats.includes(option.value)}
                onChange={() => toggleFormat(option.value)}
                className="size-4"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Критерии выполнения</p>
        <textarea
          className={TEXTAREA_CLASS}
          value={form.criteria}
          onChange={(e) => update("criteria", e.target.value)}
          rows={3}
          placeholder="Каждый критерий с новой строки"
          aria-label="Критерии выполнения"
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Что запрещено</p>
        <textarea
          className={TEXTAREA_CLASS}
          value={form.restrictions}
          onChange={(e) => update("restrictions", e.target.value)}
          rows={3}
          placeholder="Каждый запрет с новой строки"
          aria-label="Что запрещено"
        />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
        <p className="text-sm text-foreground">Доступ только по приглашениям</p>
        <Switch
          checked={form.isWhitelistEnabled}
          onCheckedChange={(checked) => update("isWhitelistEnabled", checked)}
          aria-label="Доступ только по приглашениям"
        />
      </div>
      {includeDeleted ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
          <p className="text-sm text-foreground">Удалена (скрыта)</p>
          <Switch
            checked={form.isDeleted}
            onCheckedChange={(checked) => update("isDeleted", checked)}
            aria-label="Удалена"
          />
        </div>
      ) : null}
    </>
  );
}

export function CreatePrivateTaskDialog({
  open,
  onClose,
  roomId,
  roomSlug,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomSlug?: string;
  onSuccess?: () => void;
}) {
  const { slug: slugParam } = useParams();
  const sprintRoomKey = roomSlug || slugParam || "";
  const { sprints } = useSprints({ page: 1, size: 100 }, sprintRoomKey);
  const sprintOptions = sprints
    .filter((sprint) => sprint.status === "active")
    .map((sprint) => ({ id: sprint.id, name: sprint.name }));

  const [form, setForm] = useState<PrivateTaskFormState>(() => emptyForm());
  const [ordContractTemplateId, setOrdContractTemplateId] = useState("");
  const { createPrivateCreativeTask, isPending, generalError, validationErrors } =
    useCreatePrivateCreativeTask();

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setOrdContractTemplateId("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!form.sprintId) return;
    const payload: CreatePrivateCreativeTaskRequestDto = {
      title: form.title.trim(),
      description: form.description.trim(),
      roomId,
      sprintId: form.sprintId,
      isWhitelistEnabled: form.isWhitelistEnabled,
      criteria: parseMultilineList(form.criteria),
      restrictions: parseMultilineList(form.restrictions),
      allowedFormats: formatsPayload(form.allowedFormats),
      targetPlatform: CreatePrivateCreativeTaskRequestDtoTargetPlatform.VK_GROUP,
      rewardInRubs: parseRewardBalls(form.rewardInRubs),
      allowAmbassadorMedia: true,
      allowAmbassadorText: true,
      allowAmbassadorTargetUrl: true,
      publicationsCount: 1,
      requireMaterialsReview: true,
      requirePublicationReview: true,
      ordContractTemplateId,
    };

    createPrivateCreativeTask(payload, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" showCloseButton={false} className="flex !h-[100dvh] !max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0">
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button type="button" variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={onClose} aria-label="Закрыть">
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            Создать индивидуальную задачу
          </SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
          {generalError ? (
            <Alert variant="destructive"><AlertDescription>{generalError}</AlertDescription></Alert>
          ) : null}
          <PrivateTaskFields
            form={form}
            setForm={setForm}
            validationErrors={validationErrors}
            sprintOptions={sprintOptions}
            requireSprint
          />
          <OrdContractTemplateSelect
            roomId={roomId}
            roomSlug={roomSlug}
            value={ordContractTemplateId}
            onChange={setOrdContractTemplateId}
            error={getFirstFieldError(validationErrors, "ordContractTemplateId") || undefined}
            required
          />
        </div>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>Отмена</Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={
              isPending ||
              !form.title.trim() ||
              !ordContractTemplateId ||
              !form.sprintId
            }
          >
            {isPending ? "Создание…" : "Создать"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function EditPrivateTaskDialog({
  open,
  onClose,
  task,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  task: BasePrivateCreativeTaskDto | null;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState<PrivateTaskFormState>(() => emptyForm());
  const { task: currentTask, isLoading } = usePrivateCreativeTask(task?.id ?? "");
  const { updatePrivateCreativeTask, isPending, generalError, validationErrors } =
    useUpdatePrivateCreativeTask();
  const data = currentTask ?? task;

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title,
      description: data.description ?? "",
      rewardInRubs: String(data.rewardInRubs ?? 0),
      criteria: formatMultilineList(data.criteria),
      restrictions: formatMultilineList(data.restrictions),
      sprintId: data.sprintId ?? "",
      allowedFormats: (data.allowedFormats ?? []) as CreativeTaskFormat[],
      isWhitelistEnabled: data.isWhitelistEnabled ?? true,
      isDeleted: data.isDeleted,
    });
  }, [data, open]);

  const handleSubmit = () => {
    if (!task?.id) return;

    const payload: UpdatePrivateCreativeTaskRequestDto = {
      title: form.title.trim(),
      description: form.description.trim(),
      isDeleted: form.isDeleted,
      isWhitelistEnabled: form.isWhitelistEnabled,
      criteria: parseMultilineList(form.criteria),
      restrictions: parseMultilineList(form.restrictions),
      sprintId: form.sprintId || undefined,
      allowedFormats: formatsPayload(form.allowedFormats),
      rewardInRubs: parseRewardBalls(form.rewardInRubs),
    };

    updatePrivateCreativeTask(
      { id: task.id, data: payload },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  const loading = open && (isLoading || !data);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" showCloseButton={false} className="flex !h-[100dvh] !max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0">
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button type="button" variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={onClose} aria-label="Закрыть">
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            Редактировать индивидуальную задачу
          </SheetTitle>
        </SheetHeader>
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <PageLoader label="Загрузка…" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
            {generalError ? (
              <Alert variant="destructive"><AlertDescription>{generalError}</AlertDescription></Alert>
            ) : null}
            <PrivateTaskFields form={form} setForm={setForm} validationErrors={validationErrors} includeDeleted />
          </div>
        )}
        {!loading ? (
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
            <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>Отмена</Button>
            <Button type="button" size="lg" onClick={handleSubmit} disabled={isPending || !form.title.trim()}>
              {isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function formatDeadline(value?: string | null) {
  if (!value) return "Без срока";
  return `до ${new Date(value).toLocaleDateString("ru-RU")}`;
}

function PrivateTaskRow({
  task,
  onEdit,
  onDelete,
  deadline,
}: {
  task: BasePrivateCreativeTaskDto;
  onEdit: (task: BasePrivateCreativeTaskDto) => void;
  onDelete: (task: BasePrivateCreativeTaskDto) => void;
  deadline?: string | null;
}) {
  const { slug } = useParams<{ slug: string }>();
  const detailPath = `/rooms/${slug ?? ""}/creativetasks/private/${task.id}`;
  const { submissions, pagination: submissionsPagination } = usePrivateSubmissions(task.id, {
    page: 1,
    size: 100,
  });
  const { pagination: performersPagination } = useCreativeTaskWhitelist(task.id, {
    page: 1,
    size: 1,
  });
  const waitingForReview = submissions.filter(
    (submission) =>
      submission.status === "waiting_for_review_materials" ||
      submission.status === "waiting_for_review_publication"
  ).length;
  const answersTotal = submissionsPagination?.total ?? 0;

  return (
    <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-border px-4 py-2 text-[13px] font-medium leading-4 sm:flex-nowrap sm:gap-4">
      <Link
        to={detailPath}
        className="min-w-0 flex-1 truncate text-foreground no-underline hover:underline"
      >
        {task.title}
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {task.isDeleted ? (
          <Badge variant="outline" className="gap-1 rounded-full px-1.5 py-1 font-medium">
            <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden />
            Удалено
          </Badge>
        ) : waitingForReview > 0 ? (
          <Badge className="rounded-full bg-[#d52094]/15 px-1.5 py-1 font-medium text-[#d52094] hover:bg-[#d52094]/15">
            {waitingForReview} {waitingForReview === 1 ? "ответ" : "ответа"}
          </Badge>
        ) : answersTotal > 0 ? (
          <Badge variant="secondary" className="gap-1 rounded-full px-1.5 py-1 font-medium">
            <Check className="size-3" aria-hidden />
            Все проверено
          </Badge>
        ) : (
          <Badge variant="secondary" className="rounded-full px-1.5 py-1 font-medium">
            Ответов нет
          </Badge>
        )}

        <Badge variant="outline" className="gap-0.5 rounded-full px-1.5 py-1 font-medium">
          <Users className="size-4" aria-hidden />
          {performersPagination?.total ?? 0}
        </Badge>
      </div>

      <span className="w-[104px] shrink-0 text-right text-muted-foreground">
        {formatDeadline(deadline)}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shadow-none"
          onClick={() => onEdit(task)}
          aria-label={`Редактировать «${task.title}»`}
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shadow-none"
          onClick={() => onDelete(task)}
          aria-label={`Удалить «${task.title}»`}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export default function PrivateCreativeTasksPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [editTask, setEditTask] = useState<BasePrivateCreativeTaskDto | null>(null);

  const { room, isLoading: isLoadingRoom, isError: isRoomError, error: roomError } =
    useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const { tasks, isLoading, isError, error, refetch, pagination } = useRoomPrivateCreativeTasks(roomId, {
    page,
    size: 100,
  });
  const { sprints } = useSprints({ page: 1, size: 100 }, slug ?? "");
  const { updatePrivateCreativeTask, isPending: isDeleting } =
    useUpdatePrivateCreativeTask();

  const activeSprintId = sprints.find((sprint) => sprint.status === "active")?.id;
  const createPath = `/rooms/${slug ?? ""}/creativetasks/private/new${
    activeSprintId ? `?sprintId=${encodeURIComponent(activeSprintId)}` : ""
  }`;
  const sprintDeadlineById = new Map(
    sprints.map((sprint) => [sprint.id, sprint.ignoreEndDate ? null : sprint.endDate])
  );

  const handleDelete = (task: BasePrivateCreativeTaskDto) => {
    if (!window.confirm(`Удалить задание «${task.title}»?`)) return;
    updatePrivateCreativeTask(
      { id: task.id, data: { isDeleted: true } },
      { onSuccess: () => void refetch() }
    );
  };

  if (isLoadingRoom) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomError) {
    return <CreativeTasksErrorState errorMessage={(roomError as Error)?.message} />;
  }

  return (
    <div className="-m-4 min-h-dvh w-[calc(100%+2rem)] bg-white md:-m-6 md:w-[calc(100%+3rem)]">
      <div className="flex min-h-12 items-center gap-2 border-b border-border px-4 py-2.5">
        <h1 className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 text-foreground">
          Индивидуальные задания
        </h1>
        <Button
          type="button"
          size="sm"
          className="h-7 gap-1 bg-[#2563eb] px-2 text-[13px] hover:bg-[#2563eb]/90"
          onClick={() => navigate(createPath)}
        >
          <Plus className="size-4" aria-hidden />
          Добавить
        </Button>
      </div>

      <div>

        {isLoading ? (
          <div className="flex justify-center py-8"><PageLoader label="Загрузка задач…" /></div>
        ) : isError ? (
          <CreativeTasksErrorState errorMessage={(error as Error)?.message} />
        ) : tasks.length === 0 && !pagination?.total ? (
          <div className="p-4">
            <CreativeTasksEmptyState onCreateClick={() => navigate(createPath)} />
          </div>
        ) : (
          <>
            <div>
              {tasks.map((task) => (
                <PrivateTaskRow
                  key={task.id}
                  task={task}
                  deadline={sprintDeadlineById.get(task.sprintId)}
                  onEdit={setEditTask}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 ? (
              <div className="p-4">
                <CreativesPaginationControls page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
              </div>
            ) : null}
          </>
        )}
      </div>

      <EditPrivateTaskDialog
        open={!!editTask}
        onClose={() => setEditTask(null)}
        task={editTask}
        onSuccess={() => {
          setEditTask(null);
          void refetch();
        }}
      />
      {isDeleting ? <span className="sr-only" role="status">Удаление задания…</span> : null}
    </div>
  );
}
