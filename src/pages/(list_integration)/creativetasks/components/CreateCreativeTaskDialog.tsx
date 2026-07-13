import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import { useCreateCreativeTask } from "@/hooks/creativetasks/useCreateCreativeTask";
import type {
  CreateCreativeTaskRequestDto,
  CreateCreativeTaskRequestDtoAllowedFormatsItem,
} from "@/api/generated/model";
import {
  CREATIVE_TASK_FORMAT_OPTIONS,
  parseMultilineList,
  parseRewardBalls,
  type CreativeTaskFormat,
} from "../utils/creativetaskUtils";
import { OrdContractTemplateSelect } from "../../ord/components/OrdContractTemplateSelect";

const DESC_CLASS =
  "min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  fieldErrors[fieldName]?.[0] || "";
const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string) =>
  Boolean(fieldErrors[fieldName]?.length);

/** Локальная datetime строка → ISO */
function toISOString(localDateTime: string): string {
  if (!localDateTime) return "";
  return new Date(localDateTime).toISOString();
}

interface CreateCreativeTaskDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomSlug?: string;
  onSuccess?: () => void;
}

export function CreateCreativeTaskDialog({
  open,
  onClose,
  roomId,
  roomSlug,
  onSuccess,
}: CreateCreativeTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [minimalRewardInBalls, setMinimalRewardInBalls] = useState("0");
  const [allowedFormats, setAllowedFormats] = useState<CreativeTaskFormat[]>([]);
  const [criteria, setCriteria] = useState("");
  const [ordContractTemplateId, setOrdContractTemplateId] = useState("");

  const {
    createCreativeTask,
    isPending,
    generalError,
    validationErrors,
  } = useCreateCreativeTask();

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setStartsAt("");
      setEndsAt("");
      setMinimalRewardInBalls("0");
      setAllowedFormats([]);
      setCriteria("");
      setOrdContractTemplateId("");
    }
  }, [open]);

  const toggleFormat = (format: CreativeTaskFormat) => {
    setAllowedFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format]
    );
  };

  const handleSubmit = () => {
    if (!roomId) return;
    const payload: CreateCreativeTaskRequestDto = {
      title: title.trim(),
      description: description.trim(),
      startsAt: toISOString(startsAt),
      endsAt: toISOString(endsAt),
      roomId,
      criteria: parseMultilineList(criteria),
      allowedFormats: allowedFormats as CreateCreativeTaskRequestDtoAllowedFormatsItem[],
      minimalRewardInBalls: parseRewardBalls(minimalRewardInBalls),
      allowAmbassadorMedia: true,
      allowAmbassadorText: true,
      ordContractTemplateId,
    };
    createCreativeTask(payload, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
      },
    });
  };

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
            Создать креативную задачу
          </SheetTitle>
        </SheetHeader>

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
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isPending}>
            Отмена
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !ordContractTemplateId}
          >
            {isPending ? "Создание…" : "Создать"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
