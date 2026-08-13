import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  PageLoader,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from "@senler/ui";
import { useUpdateCreativeTask } from "@/hooks/creativetasks/useUpdateCreativeTask";
import { useCreativeTask } from "@/hooks/creativetasks/useCreativeTask";
import type {
  BaseCreativeTaskDto,
  UpdateCreativeTaskRequestDto,
  UpdateCreativeTaskRequestDtoAllowedFormatsItem,
} from "@/api/generated/model";
import {
  CREATIVE_TASK_FORMAT_OPTIONS,
  formatMultilineList,
  parseMultilineList,
  parseRewardBalls,
  type CreativeTaskFormat,
} from "../utils/creativetaskUtils";

const DESC_CLASS =
  "min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] || "";
const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  Boolean(fieldErrors[fieldName]?.length);

/** ISO datetime в значение для input datetime-local */
function toLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

/** Локальная datetime строка в ISO */
function toISOString(localDateTime: string): string {
  if (!localDateTime) return "";
  return new Date(localDateTime).toISOString();
}

interface EditCreativeTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: BaseCreativeTaskDto | null;
  onSuccess?: () => void;
}

export function EditCreativeTaskDialog({
  open,
  onClose,
  task,
  onSuccess,
}: EditCreativeTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [minimalRewardInBalls, setMinimalRewardInBalls] = useState("0");
  const [allowedFormats, setAllowedFormats] = useState<CreativeTaskFormat[]>([]);
  const [criteria, setCriteria] = useState("");
  const [restrictions, setRestrictions] = useState("");

  const { task: currentTask, isLoading: isLoadingTask } = useCreativeTask(
    task?.id ?? ""
  );
  const {
    updateCreativeTask,
    isPending,
    generalError,
    validationErrors,
  } = useUpdateCreativeTask();

  const data = currentTask ?? task;

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDescription(data.description ?? "");
      setStartsAt(toLocalDateTime(data.startsAt));
      setEndsAt(toLocalDateTime(data.endsAt));
      setIsDeleted(data.isDeleted);
      setMinimalRewardInBalls(String(data.minimalRewardInBalls ?? 0));
      setAllowedFormats((data.allowedFormats ?? []) as CreativeTaskFormat[]);
      setCriteria(formatMultilineList(data.criteria));
      setRestrictions(formatMultilineList(data.restrictions));
    }
  }, [data, open]);

  const toggleFormat = (format: CreativeTaskFormat) => {
    setAllowedFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format]
    );
  };

  const handleSubmit = () => {
    if (!task?.id) return;
    const payload: UpdateCreativeTaskRequestDto = {
      title: title.trim(),
      description: description.trim(),
      startsAt: toISOString(startsAt),
      endsAt: toISOString(endsAt),
      isDeleted,
      criteria: parseMultilineList(criteria),
      restrictions: parseMultilineList(restrictions),
      allowedFormats: allowedFormats as UpdateCreativeTaskRequestDtoAllowedFormatsItem[],
      minimalRewardInBalls: parseRewardBalls(minimalRewardInBalls),
    };
    updateCreativeTask(
      { id: task.id, data: payload },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  const loading = open && (isLoadingTask || !data);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex !h-[100dvh] !max-h-[100dvh] flex-col gap-0 rounded-none border-0 p-0"
      >
        <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </Button>
          <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
            Редактировать задачу
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <PageLoader label="Загрузка…" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
            {generalError ? (
              <Alert variant="destructive" className="w-full">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Название *</p>
              <InputField
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={hasFieldError(validationErrors, "title")}
                helperText={getFirstFieldError(validationErrors, "title") ?? undefined}
                aria-label="Название"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Описание</p>
              <textarea
                className={DESC_CLASS}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                aria-label="Описание"
              />
              {hasFieldError(validationErrors, "description") ? (
                <p className="text-sm text-destructive">
                  {getFirstFieldError(validationErrors, "description")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Дата начала</p>
              <InputField
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                error={hasFieldError(validationErrors, "startsAt")}
                helperText={getFirstFieldError(validationErrors, "startsAt") ?? undefined}
                aria-label="Дата начала"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Дата окончания</p>
              <InputField
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                error={hasFieldError(validationErrors, "endsAt")}
                helperText={getFirstFieldError(validationErrors, "endsAt") ?? undefined}
                aria-label="Дата окончания"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Минимальная награда, баллы</p>
              <InputField
                type="number"
                min={0}
                step={1}
                value={minimalRewardInBalls}
                onChange={(e) => setMinimalRewardInBalls(e.target.value)}
                error={hasFieldError(validationErrors, "minimalRewardInBalls")}
                helperText={getFirstFieldError(validationErrors, "minimalRewardInBalls") ?? undefined}
                aria-label="Минимальная награда в баллах"
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
                      checked={allowedFormats.includes(option.value)}
                      onChange={() => toggleFormat(option.value)}
                      className="size-4"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {hasFieldError(validationErrors, "allowedFormats") ? (
                <p className="text-sm text-destructive">
                  {getFirstFieldError(validationErrors, "allowedFormats")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Критерии выполнения</p>
              <textarea
                className={DESC_CLASS}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={3}
                placeholder="Например: указать ссылку на публикацию&#10;сохранить публикацию 7 дней"
                aria-label="Критерии выполнения"
              />
              <p className="text-xs text-muted-foreground">Каждый критерий укажите с новой строки.</p>
              {hasFieldError(validationErrors, "criteria") ? (
                <p className="text-sm text-destructive">
                  {getFirstFieldError(validationErrors, "criteria")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Что запрещено</p>
              <textarea
                className={DESC_CLASS}
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                rows={3}
                placeholder="Каждый запрет с новой строки"
                aria-label="Что запрещено"
              />
              {hasFieldError(validationErrors, "restrictions") ? (
                <p className="text-sm text-destructive">
                  {getFirstFieldError(validationErrors, "restrictions")}
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
              <p className="text-sm text-foreground">Удалена (скрыта)</p>
              <Switch
                checked={isDeleted}
                onCheckedChange={setIsDeleted}
                aria-label="Удалена (скрыта)"
              />
            </div>
          </div>
        )}

        {!loading ? (
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleSubmit}
              disabled={isPending || !title.trim()}
            >
              {isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
