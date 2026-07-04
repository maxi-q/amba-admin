import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Pencil, X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
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
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomPrivateCreativeTasks } from "@/hooks/creativetasks/useRoomPrivateCreativeTasks";
import { usePrivateCreativeTask } from "@/hooks/creativetasks/usePrivateCreativeTask";
import { useCreatePrivateCreativeTask } from "@/hooks/creativetasks/useCreatePrivateCreativeTask";
import { useUpdatePrivateCreativeTask } from "@/hooks/creativetasks/useUpdatePrivateCreativeTask";
import { CreativeTasksErrorState } from "./components/CreativeTasksErrorState";
import { CreativeTasksEmptyState } from "./components/CreativeTasksEmptyState";
import { CreativeTasksHeader } from "./components/CreativeTasksHeader";
import { CreativesPaginationControls } from "./components/CreativesPaginationControls";
import { CreativeTaskWhitelistSection } from "./components/CreativeTaskWhitelistSection";
import {
  CREATIVE_TASK_FORMAT_OPTIONS,
  formatDateRange,
  formatRubReward,
  formatTaskFormat,
  formatMultilineList,
  isTaskActive,
  parseMultilineList,
  parseRewardBalls,
  type CreativeTaskFormat,
} from "./utils/creativetaskUtils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] || "";
const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  Boolean(fieldErrors[fieldName]?.length);

function toISOString(localDateTime: string): string {
  if (!localDateTime) return "";
  return new Date(localDateTime).toISOString();
}

function toLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface PrivateTaskFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  rewardInRubs: string;
  criteria: string;
  allowedFormats: CreativeTaskFormat[];
  isWhitelistEnabled: boolean;
  isDeleted: boolean;
}

const emptyForm = (): PrivateTaskFormState => ({
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  rewardInRubs: "0",
  criteria: "",
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
}: {
  form: PrivateTaskFormState;
  setForm: (next: PrivateTaskFormState) => void;
  validationErrors: Record<string, string[]>;
  includeDeleted?: boolean;
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Дата начала</p>
          <InputField
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => update("startsAt", e.target.value)}
            error={hasFieldError(validationErrors, "startsAt")}
            helperText={getFirstFieldError(validationErrors, "startsAt") || undefined}
            aria-label="Дата начала"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Дата окончания</p>
          <InputField
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => update("endsAt", e.target.value)}
            error={hasFieldError(validationErrors, "endsAt")}
            helperText={getFirstFieldError(validationErrors, "endsAt") || undefined}
            aria-label="Дата окончания"
          />
        </div>
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

function CreatePrivateTaskDialog({
  open,
  onClose,
  roomId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState<PrivateTaskFormState>(() => emptyForm());
  const { createPrivateCreativeTask, isPending, generalError, validationErrors } =
    useCreatePrivateCreativeTask();

  useEffect(() => {
    if (!open) setForm(emptyForm());
  }, [open]);

  const handleSubmit = () => {
    const payload: CreatePrivateCreativeTaskRequestDto = {
      title: form.title.trim(),
      description: form.description.trim(),
      startsAt: toISOString(form.startsAt),
      endsAt: toISOString(form.endsAt),
      roomId,
      isWhitelistEnabled: form.isWhitelistEnabled,
      criteria: parseMultilineList(form.criteria),
      allowedFormats: formatsPayload(form.allowedFormats),
      rewardInRubs: parseRewardBalls(form.rewardInRubs),
      allowAmbassadorMedia: true,
      allowAmbassadorText: true,
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
          <PrivateTaskFields form={form} setForm={setForm} validationErrors={validationErrors} />
        </div>
        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>Отмена</Button>
          <Button type="button" size="lg" onClick={handleSubmit} disabled={isPending || !form.title.trim()}>
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
      startsAt: toLocalDateTime(data.startsAt),
      endsAt: toLocalDateTime(data.endsAt),
      rewardInRubs: String(data.rewardInRubs ?? 0),
      criteria: formatMultilineList(data.criteria),
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
      startsAt: toISOString(form.startsAt),
      endsAt: toISOString(form.endsAt),
      isDeleted: form.isDeleted,
      isWhitelistEnabled: form.isWhitelistEnabled,
      criteria: parseMultilineList(form.criteria),
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

function PrivateTaskCard({
  task,
  onEdit,
}: {
  task: BasePrivateCreativeTaskDto;
  onEdit: (task: BasePrivateCreativeTaskDto) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const dateRange = formatDateRange(task.startsAt, task.endsAt ?? null);
  const active = !task.isDeleted && isTaskActive(task.startsAt, task.endsAt ?? null);

  return (
    <Card className={`border border-border shadow-sm ${task.isDeleted ? "opacity-60" : ""}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`mb-1 text-lg font-medium leading-snug ${task.isDeleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {task.title}
            </h3>
            <p className={`line-clamp-2 text-sm ${task.isDeleted ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
              {task.description || "—"}
            </p>
            <p className={`mt-1 text-sm ${active ? "font-medium text-green-700 dark:text-green-400" : "text-muted-foreground"}`}>
              {dateRange}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{formatRubReward(task.rewardInRubs)}</Badge>
              {task.allowedFormats?.length ? (
                task.allowedFormats.map((format) => (
                  <Badge key={format} variant="outline" className="font-normal">
                    {formatTaskFormat(format)}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="font-normal">Любой формат</Badge>
              )}
              <Badge variant={task.isWhitelistEnabled ? "secondary" : "outline"}>
                {task.isWhitelistEnabled ? "По приглашениям" : "Без ограничения"}
              </Badge>
            </div>
            {task.criteria?.length ? (
              <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                Критерии: {task.criteria.join("; ")}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!task.isDeleted ? (
              <Badge variant={active ? "success" : "secondary"}>{active ? "Активна" : "Неактивна"}</Badge>
            ) : null}
            <Link to={`/rooms/${slug ?? ""}/creativetasks/private/${task.id}`}>
              <Button type="button" variant="outline" size="sm">
                Открыть
              </Button>
            </Link>
            <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => setExpanded((prev) => !prev)} aria-label={expanded ? "Свернуть" : "Развернуть"}>
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-9 text-primary" onClick={() => onEdit(task)} aria-label="Редактировать">
              <Pencil className="size-4" />
            </Button>
          </div>
        </div>
        {expanded ? (
          <div className="mt-4">
            <CreativeTaskWhitelistSection task={task} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function PrivateCreativeTasksPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<BasePrivateCreativeTaskDto | null>(null);

  const { room, isLoading: isLoadingRoom, isError: isRoomError, error: roomError } =
    useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";
  const { tasks, isLoading, isError, error, refetch, pagination } = useRoomPrivateCreativeTasks(roomId, {
    page,
    size: pageSize,
  });

  const sortedTasks = useMemo(() => tasks, [tasks]);

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
    <div className="w-full px-2 py-3">
      <CreativeTasksHeader />
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight">Индивидуальные задачи</h1>
        <p className="text-sm text-muted-foreground">
          Приватные задания с рублёвой наградой и доступом для выбранных амбассадоров.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" size="lg" onClick={() => setCreateDialogOpen(true)}>
            Создать индивидуальную задачу
          </Button>
          {pagination && pagination.totalPages > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">На странице</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="Размер" /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><PageLoader label="Загрузка задач…" /></div>
        ) : isError ? (
          <CreativeTasksErrorState errorMessage={(error as Error)?.message} />
        ) : sortedTasks.length === 0 && !pagination?.total ? (
          <CreativeTasksEmptyState onCreateClick={() => setCreateDialogOpen(true)} />
        ) : (
          <>
            {pagination ? <p className="text-sm text-muted-foreground">Всего: {pagination.total}</p> : null}
            <div className="flex flex-col gap-3">
              {sortedTasks.map((task) => (
                <PrivateTaskCard key={task.id} task={task} onEdit={setEditTask} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 ? (
              <CreativesPaginationControls page={page} totalPages={pagination.totalPages} onPageChange={setPage} className="mt-2" />
            ) : null}
          </>
        )}
      </div>

      <CreatePrivateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        roomId={roomId}
        onSuccess={() => void refetch()}
      />
      <EditPrivateTaskDialog
        open={!!editTask}
        onClose={() => setEditTask(null)}
        task={editTask}
        onSuccess={() => {
          setEditTask(null);
          void refetch();
        }}
      />
    </div>
  );
}
